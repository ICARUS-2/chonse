import { EngineName } from "@/types/enums";
import { UciEngine } from "./uciEngine";
import { isMultiThreadSupported, isWasmSupported } from "./shared";

export class Stockfish17_1 {
  public static async create(lite?: boolean): Promise<UciEngine> {
    if (!Stockfish17_1.isSupported()) {
      throw new Error("Stockfish 17.1 is not supported");
    }

    const multiThreadIsSupported = isMultiThreadSupported();
    if (!multiThreadIsSupported) console.log("Single thread mode");

    const enginePath = `engines/stockfish-17.1/stockfish-17.1${
      lite ? "-lite" : ""
    }${multiThreadIsSupported ? "" : "-single"}.js`;

    const engineName = lite
      ? EngineName.Stockfish17_1Lite
      : EngineName.Stockfish17_1;

    return UciEngine.create(engineName, enginePath);
  }

  public static isSupported() {
    return isWasmSupported();
  }
}
