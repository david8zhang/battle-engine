import { LooseObject } from "../interface/LooseObject";

export default class Utils {
  static convertObjectToArray(object : LooseObject) : LooseObject[] {
    if (Array.isArray(object)) {
      return object;
    } else {
      return Object.keys(object).map((key : string) => object[key]);
    }
  }
}