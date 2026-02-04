import configuration from "../../content-collections.ts";
import { GetTypeByName } from "@content-collections/core";

export type Job = GetTypeByName<typeof configuration, "jobs">;
export declare const allJobs: Array<Job>;

export type Education = GetTypeByName<typeof configuration, "education">;
export declare const allEducations: Array<Education>;

export {};
