import { EventSource, createTypeOrmEventStore } from "@xtaskjs/event-source";
import { APP_TYPEORM_WRITE_DATA_SOURCE_NAME } from "../../../data-source";

@EventSource({
  store: createTypeOrmEventStore({
    dataSourceName: APP_TYPEORM_WRITE_DATA_SOURCE_NAME,
    tableName: "user_account_event_store",
  }),
})
export class SiteEventSourceConfiguration {}