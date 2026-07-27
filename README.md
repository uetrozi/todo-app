## About The Project

Task Tango is a simple to-do app with some basic "TODO list" functionality.
[Visit TaskTango](https://tasktango.vercel.app/)

[![TaskTango](https://github.com/uetrozi/uetrozi/assets/139115048/3b26e730-3468-439d-898e-8c619da2211d)](https://tasktango.vercel.app/)

## MongoDB Cluster Setup (Atlas)

If your old cluster was shut down, create a new Atlas cluster and update `MONGODB_URI`:

1. Create a free Atlas project and cluster (M0).
2. Create a database user with read/write access.
3. Add IP access for your app traffic (for fast recovery, allow `0.0.0.0/0`; tighten later).
4. Copy the SRV connection string and replace placeholders using `.env.example` as reference.
5. Set `MONGODB_URI` in local `.env.local` for development.
6. Set `MONGODB_URI` in Vercel project Environment Variables for Production.
7. Redeploy on Vercel.

After redeploy, verify:

- `GET /api/tasks` returns `200`.
- The home page loads tasks instead of showing `failed to load`.
