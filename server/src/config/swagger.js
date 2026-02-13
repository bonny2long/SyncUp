import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SyncUp API",
      version: "1.0.0",
      description: "Mentorship & Collaboration Platform API",
      contact: {
        name: "SyncUp Team",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Project: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["planned", "active", "completed", "archived"] },
            visibility: { type: "string", enum: ["public", "seeking"] },
            owner_id: { type: "integer" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        ProgressUpdate: {
          type: "object",
          properties: {
            id: { type: "integer" },
            project_id: { type: "integer" },
            user_id: { type: "integer" },
            content: { type: "string" },
            signal_type: { type: "string", enum: ["learned", "applied", "taught"] },
            skill_ids: { type: "array", items: { type: "integer" } },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Session: {
          type: "object",
          properties: {
            id: { type: "integer" },
            mentor_id: { type: "integer" },
            intern_id: { type: "integer" },
            status: { type: "string", enum: ["pending", "accepted", "declined", "completed", "cancelled"] },
            scheduled_at: { type: "string", format: "date-time" },
            topic: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["intern", "mentor", "admin"] },
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: { type: "integer" },
            user_id: { type: "integer" },
            type: { type: "string" },
            message: { type: "string" },
            read: { type: "boolean" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  msg: { type: "string" },
                  path: { type: "string" },
                  location: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

export const specs = swaggerJsdoc(options);
export const swaggerDocs = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "SyncUp API Docs",
});
