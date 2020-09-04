export default class Monitor {
  #cancelCallbacks;
  static modules = [];

  constructor(target, options={}) {
    this.#cancelCallbacks = Monitor.modules.map(module => 
      module.bind(this)(target, options)
    );
  }

  cancel() {
    this.#cancelCallbacks.forEach(callback => callback());
  }
}