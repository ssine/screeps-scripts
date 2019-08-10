function run_tower(tower: StructureTower) {
  // first attack hostiles
  let hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
  if (hostiles.length > 0) {
    tower.attack(hostiles[0]);
    return;
  }
  // then repair other structures
  let structures = tower.room.find(FIND_STRUCTURES, {
    filter: structure => structure.hits < structure.hitsMax
  });
  if (structures.length > 0) {
    tower.repair(structures[0]);
    return;
  }
}

function run_towers_in_room(room_name: string) {
  let towers = Game.rooms[room_name].find(
    FIND_MY_STRUCTURES, {
      filter: {structureType: STRUCTURE_TOWER}
    }) as StructureTower[];
  towers.forEach(t => run_tower(t));
}

function run_towers() {
  for (let name in Game.rooms)
    run_towers_in_room(name);
}

export { run_towers }
