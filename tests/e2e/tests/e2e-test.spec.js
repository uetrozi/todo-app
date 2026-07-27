import randomItem from "./utils/utils";
const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  const tasks = [];

  await page.route("**/api/tasks", async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(tasks),
      });
    }

    if (method === "POST") {
      const payload = route.request().postDataJSON() || {};
      const title = payload.title || "Untitled task";
      const newTask = {
        _id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        title,
        completed: false,
      };
      tasks.unshift(newTask);

      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(newTask),
      });
    }

    return route.fulfill({ status: 405 });
  });

  await page.route("**/api/tasks/*", async (route) => {
    const method = route.request().method();
    const urlParts = route.request().url().split("/");
    const taskId = urlParts[urlParts.length - 1];
    const taskIndex = tasks.findIndex((task) => task._id === taskId);

    if (method === "DELETE") {
      if (taskIndex === -1) {
        return route.fulfill({ status: 404 });
      }
      const [deletedTask] = tasks.splice(taskIndex, 1);
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(deletedTask),
      });
    }

    if (method === "PUT" || method === "PATCH") {
      if (taskIndex === -1) {
        return route.fulfill({ status: 404 });
      }

      const payload = route.request().postDataJSON() || {};
      if (Object.keys(payload).length === 0) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          completed: !tasks[taskIndex].completed,
        };
      }
      if (typeof payload.completed === "boolean") {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          completed: payload.completed,
        };
      }
      if (typeof payload.title === "string") {
        tasks[taskIndex] = { ...tasks[taskIndex], title: payload.title };
      }

      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(tasks[taskIndex]),
      });
    }

    return route.fulfill({ status: 405 });
  });

  await page.route("**/api/status/done", async (route) => {
    const doneTasks = tasks.filter((task) => task.completed);
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(doneTasks),
    });
  });

  await page.route("**/api/status/upcoming", async (route) => {
    const upcomingTasks = tasks.filter((task) => !task.completed);
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(upcomingTasks),
    });
  });

  await page.goto("/");
  await expect(page.getByPlaceholder("Add new task").first()).toBeVisible();
});

test.describe("New Todo", () => {
  test("Add a task and mark it done", async ({ page }) => {
    const todoText = `${randomItem()}-${Date.now()}`;
    const newTaskInput = page.getByPlaceholder("Add new task").first();

    await newTaskInput.fill(todoText);
    await newTaskInput.press("Enter");

    const listItem = page
      .getByRole("listitem")
      .filter({ hasText: todoText })
      .first();
    await expect(listItem).toBeVisible();

    await listItem.locator("label span").first().click();
    await expect(page.getByText("Task Done")).toBeVisible();

    await listItem.getByRole("button", { name: "Delete a task" }).click();
    await expect(page.getByText("Task deleted")).toBeVisible();
  });

  test("Add a task and delete it", async ({ page }) => {
    const todoText = `${randomItem()}-${Date.now()}`;
    const newTaskInput = page.getByPlaceholder("Add new task").first();

    await newTaskInput.fill(todoText);
    await newTaskInput.press("Enter");

    const listItem = page
      .getByRole("listitem")
      .filter({ hasText: todoText })
      .first();
    await expect(listItem).toBeVisible();

    await listItem.getByRole("button", { name: "Delete a task" }).click();
    await expect(page.getByText("Task deleted")).toBeVisible();
    await expect(listItem).toHaveCount(0);
  });
});
