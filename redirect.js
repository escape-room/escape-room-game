const buildQueryString = (params) => Object.keys(params).map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])).join('&')

const bindRedirectListeners = () => {
  console.log("BIND REDIRECT LISTENERS")

  let socket = io({
    query: buildQueryString({ url: window.location.href }),
  })

  const on = (name, callback) => socket.on(name, (data) => {
    console.log("RECIEVED: <" + name + ">")
    console.log("  | DATA: " + data)
    callback(data)
  })

  on('computer--part-2', () => {
    window.location.href = '../part2.html'
  })

  on('computer--part-1', () => {
    window.location.href = '../part1.html'
  })
}

