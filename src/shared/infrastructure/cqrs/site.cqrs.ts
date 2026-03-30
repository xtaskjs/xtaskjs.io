import { Cqrs } from "@xtaskjs/cqrs";
import { APP_TYPEORM_DATA_SOURCE_NAME } from "../../../data-source";

@Cqrs({
  readDataSourceName: APP_TYPEORM_DATA_SOURCE_NAME,
  writeDataSourceName: APP_TYPEORM_DATA_SOURCE_NAME,
})
export class SiteCqrsConfiguration {}