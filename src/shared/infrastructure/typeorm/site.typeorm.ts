import { registerTypeOrmDataSource } from "@xtaskjs/typeorm";
import { createAppReadDataSourceOptions, createAppWriteDataSourceOptions } from "../../../data-source";
import "../../../users/infrastructure/typeorm/seeders/admin-account.seeder";

registerTypeOrmDataSource(createAppWriteDataSourceOptions());
registerTypeOrmDataSource(createAppReadDataSourceOptions());