function pre_execution() {
  // clearing non-existing creep memory
  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}

export {
  pre_execution
}