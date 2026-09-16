import { stdout } from "node:process";
import { Context, Path, StateConstructor, RunStats, Fact, describe, Output } from "./theseus";

export class DefaultOutput implements Output {
  failureLogs: { name: string; context: Context<any, any>; error: Error; }[] = [];
  startTime = new Date(0);
  endTime = new Date(0);
  runStartTimes = new Map<string, Date>();
  stepStartTimes = new Map<string, Date>();

  formatTime = (totalMs: number) => {
    const totalS = totalMs / 1000;
    const totalM = totalS / 60;
    const totalH = totalM / 60;
    return totalH > 1 ? totalH.toFixed(2) + ' hours'
      : totalM > 1 ? totalM.toFixed(2) + ' minutes'
        : totalS > 1 ? totalS.toFixed(2) + ' seconds'
          : totalMs + ' milliseconds';
  };

  beforeAll = <TPlanState, TUserState>(
    paths: Path<TPlanState, TUserState>[],
    states: StateConstructor<TUserState>[],
    options: { concurrency: number; }) => {
    console.log(`== starting ${paths.length * states.length} runs, ${options.concurrency} at a time ==`);
    this.startTime = new Date();
  };

  afterAll = (stats: RunStats) => {
    this.endTime = new Date();
    const totalMs = this.endTime.getTime() - this.startTime.getTime();

    console.log();
    console.log(`Completed ${stats.successCount + stats.failureCount} steps in \x1b[33m${this.formatTime(totalMs)}\x1b[0m`);
    console.log(`  Start ${this.startTime}`);
    console.log(`  End   ${this.endTime}`);
    console.log();

    if (this.failureLogs.length) {
      const logs = this.failureLogs;
      const groups = new Map<string, { log: (typeof logs)[number]; count: number; }>();
      for (const log of logs) {
        const key = log.name + '|' + log.error.message;
        const group = groups.get(key);
        if (group) {
          group.count++;
        } else {
          groups.set(key, { log, count: 1 });
        }
      }

      console.log(`Found \x1b[31m${groups.size}\x1b[0m unique failure${groups.size === 1 ? '' : 's'}, \x1b[31m${this.failureLogs.length}\x1b[0m total:`);
      for (const group of groups.values()) {
        const error = (group.log.error.toString() as String).replace(/\n+/g, '\n').split('\n').map(l => '  ' + l).join('\n');
        console.log(`Step "${group.log.name}" \x1b[33mx${group.count}\x1b[0m` + '\n' + error + '\n');
      }
    } else {
      console.log(`Found \x1b[32m0\x1b[0m failures!`);
    }
  };

  beforeRun = <TPlanState, TUserState>(runId: string, path: Path<TPlanState, TUserState>, state: TUserState) => {
    this.runStartTimes.set(runId, new Date());
  };

  afterRun = <TPlanState, TUserState>(runId: string, path: Path<TPlanState, TUserState>, state: TUserState) => {
    const totalMs = new Date().getTime() - this.runStartTimes.get(runId)!.getTime();
    console.log(`Finished this run in \x1b[33m${this.formatTime(totalMs)}\x1b[0m`);
  };

  beforeStep = <TPlanState, TUserState>(runId: string, step: Fact<TPlanState, TUserState>, state: TUserState, context: Context<TPlanState, TUserState>) => {
    stdout.write(describe(step));
    this.stepStartTimes.set(runId, new Date());
  };

  afterStep = <TPlanState, TUserState>(runId: string, step: Fact<TPlanState, TUserState>, state: TUserState, context: Context<TPlanState, TUserState>, error: Error | null) => {
    const totalMs = new Date().getTime() - this.stepStartTimes.get(runId)!.getTime();
    if (totalMs > 1000) {
      stdout.write(` \x1b[33m[${this.formatTime(totalMs)}]\x1b[0m`);
    }

    if (error) {
      this.failureLogs.push({ name: describe(step), context, error });
      stdout.write(` \x1b[31m*FAIL*\x1b[0m\n    ${error}\n\n`);
    } else {
      stdout.write(` \x1b[32m*OK*\x1b[0m\n`);
    }
  };
}
