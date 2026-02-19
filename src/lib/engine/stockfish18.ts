import { EngineName } from "@/types/enums";
import { UciEngine } from "./uciEngine";
import { isMultiThreadSupported, isWasmSupported } from "./shared";
import { BASE_PATH } from "@/globals";

export class Stockfish18Lite {
  public static async create(): Promise<UciEngine> {
    if (!Stockfish18Lite.isSupported()) {
      throw new Error("Stockfish 18 is not supported");
    }

    const multiThreadIsSupported = isMultiThreadSupported();
    if (!multiThreadIsSupported) console.log("Single thread mode");

      const enginePath = `${BASE_PATH}/engines/stockfish-18/stockfish-18${multiThreadIsSupported ? "" : "-single"}.js`;

    const engineName = EngineName.Stockfish18_Lite;

    return UciEngine.create(engineName, enginePath);
  }

  public static isSupported() {
    return isWasmSupported();
  }
}
