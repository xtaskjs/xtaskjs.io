import { registerTypeOrmDataSource } from "@xtaskjs/typeorm";
import { createAppDataSourceOptions } from "../../../data-source";

registerTypeOrmDataSource(createAppDataSourceOptions());