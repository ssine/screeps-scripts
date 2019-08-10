function run_upgrader(creep: Creep) {
  switch (creep.memory['state']) {
    case 'init': {
      // creep.say('init');
      creep.memory['state'] = 'find_upgrade_point';
      break;
    }
    case 'find_upgrade_point': {
      // creep.say('find source');
      let flag = creep.pos.findClosestByPath(FIND_FLAGS, {
        filter: f => {
          if (f.name.indexOf('upgrade') === -1) return false;
          if (f.memory['upgrader'] !== undefined &&
            Game.getObjectById(f.memory['upgrader']) !== null &&
            f.memory['upgrader'] !== creep.id) {
              return false;
            }
          return true;
        }
      });
      if (flag !== null) {
        creep.memory['target'] = flag.pos;
        let container = flag.pos.look().filter(v => 
          v.type === LOOK_STRUCTURES && 
          v.structure !== undefined && 
          v.structure.structureType === STRUCTURE_CONTAINER
        )[0].structure as StructureContainer;
        creep.memory['container'] = container.id;
        flag.memory['upgrader'] = creep.id;
        creep.memory['state'] = 'goto_upgrade_point';
      }
      break;
    }
    case 'goto_upgrade_point': {
      let target: RoomPosition | null = creep.memory['target'];
      if (target === null) {
        creep.memory['state'] = 'find_upgrade_point';
        break;
      }
      let ret = creep.moveTo(new RoomPosition(target.x, target.y, target.roomName), { visualizePathStyle: { stroke: '#ffaa00' } });
      console.log(ret);
      if (ret !== OK) {
        creep.memory['state'] = 'find_upgrade_point';
      } else if (creep.pos.x === target.x && creep.pos.y === target.y) {
        creep.memory['state'] = 'upgrade';
      }
      break;
    }
    case 'upgrade': {
      let container: StructureContainer | null = Game.getObjectById(creep.memory['container']);
      let controller: StructureController | undefined = creep.room.controller;
      if (container === null) {
        creep.memory['state'] = 'find_upgrade_point';
        break;
      }
      if (controller === undefined) {
        creep.memory['state'] = 'find_upgrade_point';
        break;
      }
      creep.withdraw(container, RESOURCE_ENERGY);
      let ret = creep.upgradeController(controller);
      if (ret !== OK) creep.memory['state'] = 'find_upgrade_point';
      break;
    }
    case 'recycle': {
      let spawner: StructureSpawn = Object.values(Game.spawns)[0];
      creep.moveTo(spawner);
    }
  }
}

export {
  run_upgrader
}

