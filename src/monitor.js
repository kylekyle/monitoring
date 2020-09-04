const modules = [];

export default class Monitor {
  static addModule = module => modules.push(module);

  constructor(target, options={}) {
    this._cancelCallbacks = modules.map(module => 
      module.bind(this)(target, options)
    );
  }

  cancel() {
    this._cancelCallbacks.forEach(callback => callback());
  }
}