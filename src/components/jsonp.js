/**
 *
 * @param {*} url
 * @param {*} [data]
 * @param {*} callback
 */
function jsonp(url, data, callback) {
  // 1.将传入的data数据转化为url字符串形式
  // {id:1,name:'zhangsan'} => id=1&name=zhangsan
  let dataString = url.indexOf('?') == -1 ? '?' : '&'
  if (typeof data == 'function') {
    callback = data
  } else if (typeof data == 'object') {
    for (let key in data) {
      if (key == 'callback') {
        continue
      }
      dataString += key + '=' + data[key] + '&'
    }
  }

  // 2 处理url中的回调函数
  // cbFuncName回调函数的名字 ：my_json_cb_名字的前缀 + 随机数（把小数点去掉）
  const cbFuncName =
    data && data.callback
      ? data.callback
      : 'my_json_cb_' +
        Math.random()
          .toString()
          .replace('.', '')
  dataString += 'callback=' + cbFuncName

  // 3.挂载回调函数
  window[cbFuncName] = function(data) {
    callback(data)
    // 处理完回调函数的数据之后，删除jsonp的script标签
    document.body.removeChild(scriptEle)
  }
  // 4.创建一个script标签并插入到页面中
  const scriptEle = document.createElement('script')
  scriptEle.src = url + dataString

  // 5.append到页面中
  document.body.appendChild(scriptEle)
}

export default jsonp
