// Utility function to register routes
export const registerRoutes = (app, basePath, routes) => {
    routes.forEach(({ path, router }) => {
        app.use(`${basePath}${path}`, router);
    });
};