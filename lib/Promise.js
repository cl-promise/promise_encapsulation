//匿名函数自调用表达式

(function (window) {
  //Promise 构造函数
  //excutor 执行器函数（同步）
  const PENDING = 'pending'
  const RESOLVED = 'resolved'
  const REJECTED = 'rejected'
  function Promise(excutor) {
    const _this = this
    _this.status = PENDING //给Promise指定status属性，用于存储Promise当前的状态，初始值为PENDING
    _this.data = undefined   //给Promise指定data属性，用于存储结果数据
    _this.callbacks = []     //给Promise指定callbacks属性，用于存储指定的回调函数{onRESOLVED () {}, onRejected () {}}
      
    function resolve (value) {
    console.log('this', this)
    //如果当前状态不是PENDING，直接返回
    if (_this.status !== PENDING) {
        return
    }

    //状态改为resolced
    _this.status = RESOLVED
    //保存value数据
    _this.data = value
    //如果有待执行的回调函数，立即异步调用指定的回调函数
    if (_this.callbacks.length > 0) {
        setTimeout(() => { //放入队列中执行待成功的回调
            _this.callbacks.forEach(callbackObj => {
                callbackObj.onResolved(value)
            });
            }
        })
    }

    function reject (reason) {
    //如果当前状态不是PENDING，直接返回
    if (_this.status !== PENDING) {
        return
    }
    //状态改为rejected
    _this.status = REJECTED
    //保存reason数据
    _this.data = reason
    //如果有待执行的回调函数，立即异步调用指定的回调函数
    if (_this.callbacks.length > 0) {
        setTimeout(() => { //放入队列中执行待成功的回调
            _this.callbacks.forEach(callbackObj => {
                callbackObj.onRejected(reason)
            });
            }
        })
    }

    try {
        excutor(resolve, reject)
    } catch (error) { //如果执行器捕获到异常，promise对象变为rejected状态
        reject(error)
    }
    
  }

  //then原型对象的方法
  //指定一个成功和者失败的回调，返回一个promise
  Promise.prototype.then = function (onResolved, onRejected) {
    //指定默认的回调
    onResolved === 'function' ? onResolved : value => value
    //错误穿透关键一步
    onResolved === 'function' ? onRejected : resaon => {throw reason}
    
    const _this = this
    // 调用指定的回调函数，根据回调函数指定的结果， 改变return的promise状态

    /**
     * 返回的promise的状态由onResolved/onRejected执行返回的promise的结果来决定：
     * 1.如果抛出异常，返回的promise为rejected状态；
     * 2.如果返回的是非promise的任意值，返回的promise为resolved状态；
     * 3.如果返回的是promise，return的promise的结果就是这个promise的结果；
     */
    const handel = function (callback) {
        try {
            const result = callback(_this.data)
            if (result instanceof Promise) {
                //3.如果回调函数返回的时promise,return的promise的结果就是这个promise的结果
                setTimeout(() => {
                    result.then(resolve, reject)
                })
            } else {
                //2.如果回调函数返回的不是promise,return的promise就会成功，value就是返回的值
                resolve(result)
            }
        } catch (error) {
            //1.如果抛出异常，return的promise就会失败，reason就是error
            reject(error)
        }
    }

    return new Promise((resolve, reject) => {
        //pending状态,将异步回调函数保存起来
        if (_this.status === PENDING) {
            _this.callbacks.push({
                onResolved (value) {
                    handel(onResolve)
                },
                onRejected (reason) {
                    handel(onReject)
                }
            })
        } else if (_this.status === RESOLVED) {
            //resolved状态，异步执行onResolved(){}并改变return的promise的状态
            handel(onResolved)
        } else {
            //rejected状态，异步执行onRejected(){}并改变return的promise的状态
            handel(onRejected)
        }
    })

  }

  //catch原型对象的方法
  Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected)
  }
  
  //resolve函数对象的方法
  //返回一个成功或失败的promise
  Promise.resolve = function (value) {
      //返回一个成功或失败的promise
    return new Promise((resolve, reject) => {
        //value是一个promise，使用value的结果作为promise的结果
        if (value instanceof Promise) {
            value.then(resolve, reject)
        } else {//value不是promise，返回一个成功的promise
            resolve(value)
        }
    })
  }

  //reject函数对象的方法
  //返回一个指定结果的失败的promise
  Promise.reject = function (reason) {
      // 返回一个失败的promise
    return new Promise((resolve, reject) => {
        reject(reason)
    })
  }

  //all函数对象的方法
  //返回一个promise,只有当所有的promise都成功时才返回成功，否则只要有一个失败就失败
  Promise.all = function (promises) {
      const values = new Array(promises.length)
      const promiseCount = 0
      return new Promise((resolve, rejevt) => {
          promises.forEach((promise, index) => {
              Promise.resolve(promise).then(
                  value => {
                      promiseCount++ //成功就+1
                      values[index] = value //将成功的promise放入指定的位置
                      if (promiseCount == promises.length) {
                          resolve(values) //都成功则成功
                      }
                  },
                  reason => {//只要有一个失败就失败
                      reject(reason)
                  }
              )
          })
      })
  }

  //race函数对象的方法
  //返回一个promise，根据第一个改变状态的结果来决定成功还是失败
  Promise.race = function (promises) {
      return new Promise((resolve, reject) => {
          Promise.resolve(promises).forEach(promise => {
              promise.then(
                  value => {
                      resolve(value)
                  },
                  reason => {
                      reject(reason)
                  }
              )
          })
      })
  }

  window.Promise = Promise
})(window)