import { registerTypeOrmDataSource } from "@xtaskjs/typeorm";
import { createAppReadDataSourceOptions, createAppWriteDataSourceOptions } from "../../../data-source";

registerTypeOrmDataSource(createAppWriteDataSourceOptions());
registerTypeOrmDataSource(createAppReadDataSourceOptions());