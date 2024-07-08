export const handleInstallation = (app) => {
  app.on("installation.created", async (context) => {
    console.log("Installation created: ", context.payload.installation.id);
  });
};
