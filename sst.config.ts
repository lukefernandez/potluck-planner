/// <reference path="./.sst/platform/config.d.ts" />

import { ROUTES, type RouteName } from "@potluck/contract/routes";

export default $config({
  app(input) {
    return {
      name: "potluck",
      removal: input?.stage === "prod" ? "retain" : "remove",
      protect: ["prod"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const table = new sst.aws.Dynamo("PotluckTable", {
      fields: {
        pk: "string",
        sk: "string",
      },
      primaryIndex: { hashKey: "pk", rangeKey: "sk" },
    });

    const api = new sst.aws.ApiGatewayV2("PotluckApi", {
      cors: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    // Routes come from the contract's manifest; Record<RouteName, …> makes a
    // new route a type error here until it's given a handler.
    const handlers: Record<RouteName, string> = {
      createPotluck: "packages/functions/src/create-potluck.handler",
      getPotluck: "packages/functions/src/get-potluck.handler",
      createItem: "packages/functions/src/create-item.handler",
      deleteItem: "packages/functions/src/delete-item.handler",
    };

    for (const name of Object.keys(ROUTES) as RouteName[]) {
      const { method, template } = ROUTES[name];
      api.route(`${method} ${template}`, {
        handler: handlers[name],
        link: [table],
      });
    }

    new sst.aws.Cron("Warmer", {
      schedule: "rate(5 minutes)",
      job: {
        handler: "packages/functions/src/warmer.handler",
        environment: {
          API_URL: api.url,
        },
      },
    });

    return {
      api: api.url,
      table: table.name,
    };
  },
});
