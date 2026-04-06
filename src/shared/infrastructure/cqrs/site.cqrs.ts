import { Cqrs } from "@xtaskjs/cqrs";
import { APP_TYPEORM_READ_DATA_SOURCE_NAME, APP_TYPEORM_WRITE_DATA_SOURCE_NAME } from "../../../data-source";

@Cqrs({
  readDataSourceName: APP_TYPEORM_READ_DATA_SOURCE_NAME,
  writeDataSourceName: APP_TYPEORM_WRITE_DATA_SOURCE_NAME,
})
export class SiteCqrsConfiguration {}