class Boy {
  @speak('Chinese')
  run() {
    console.log('====================================');
    console.log('i can run !');
    console.log('====================================');
  }
}

/**
 *
 *
 * @param {any} target | 指装饰的对象 boy speak紧跟的class
 * @param {any} key |  修饰的方法  run
 * @param {any} descriptor |  特定的描述
 */
function speak(language) {
  return function(target, key, descriptor) {
    console.log(target);
    console.log(key);
    console.log(descriptor);

    target.language = language;

    return descriptor;
  };
}

const luke = new Boy();

luke.run();
