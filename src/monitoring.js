const modules = [];

const monitoring = (target, options={}) => {
  const monitor = {};

  // a module must return its cancel method
  const cancels = modules.map(module => 
    module.bind(monitor)(target, options)
  )
  
  monitor.cancel = () => {
    cancels.forEach(cancel => cancel());
  }

  return monitor;
};

monitoring.addModule = module => modules.push(module);

export default monitoring;