import type { GameMap, MapId } from '../../shared/types';
import { classicMap } from './classic';
import { mrWorldwideMap } from './mr-worldwide';
import { deathValleyMap } from './death-valley';
import { luckyWheelMap } from './lucky-wheel';

export const MAPS: Record<MapId, GameMap> = {
  classic: classicMap,
  'mr-worldwide': mrWorldwideMap,
  'death-valley': deathValleyMap,
  'lucky-wheel': luckyWheelMap,
};

export function getMap(id: MapId): GameMap {
  return MAPS[id];
}
