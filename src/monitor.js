export default class Monitor {
  static modules = [];

  constructor(target, options={}) {
    this._cancelCallbacks = Monitor.modules.map(module => 
      module.bind(this)(target, options)
    );
  }

  cancel() {
    this._cancelCallbacks.forEach(callback => callback());
  }
}