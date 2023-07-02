import { connect } from "@planetscale/database"

export const createDbConnection = (databaseUrl: string) =>
  connect({
    url: databaseUrl,
    fetch: (url: string, init: any) => {
      delete (init as any)["cache"]
      return fetch(url, init)
    },
  })
