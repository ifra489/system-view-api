const http = require("http"); //for create  server
const os = require("os"); //used to  get  system info
const process = require("process"); //gives info about running
const url = require("url"); //read the path from the request URL.
const si = require("systeminformation");
//! format bytes  to  human readable  format
function formatBytes(Bytes, decimal = 2) {
  if (Bytes === 0) return "0 Bytes";
  const k = 1024;
  const size = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(Bytes) / Math.log(k));
  return parseFloat(Bytes / Math.pow(k, i)).toFixed(decimal) + "" + size[i];
}
//?format seconds   to  human readable  time
function formatTime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hour = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const second = Math.floor(seconds % 60);
  return `${days}d ${hour}h ${minutes}m ${second}s`;
}

//get cpu info
function getCPUInfo() {
  const model = os.cpus()[0].model;
  const cores = os.cpus().length;
  const architecture = os.arch();
  const load = os.loadavg();
  return {
    model,
    cores,
    architecture,
    load,
  };
}



//get memory info
const getmemoryinfo = () => {
  const total = formatBytes(os.totalmem());
  const free = formatBytes(os.freemem());
  const usage = ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2) + "%";
  return {
    total,
    free,
    usage,
  };
};

async function getBatteryInfo() {
  try {
    const batteryData = await si.battery();

    return {
      percentage: batteryData.percent + "%",
      charging: batteryData.isCharging ? "Yes" : "No",
    };
  } catch (error) {
    return {
      error: "Not Battery info",
      details: error.message,
    };
  }
}


//get os info
const getOsInfo = () => {
  const platform = os.platform();
  const type = os.type();
  const release = os.release();
  const hostname = os.hostname();
  const uptime = formatTime(os.uptime());
  return {
    platform, type, release, hostname, uptime
  }
};

//get user info
const getUserInfo = () => {
  const user = os.userInfo();
  return {
    user,
  };
};

//get network info
const getNetworkInfo = () => {
  const network = os.networkInterfaces();
  return{
    network,
  };
};
//get process
const getProcess = () => {
  const pid = process.pid;
  const title = process.title;
  const nodeVerion = process.version;
  const uptime = formatTime(process.uptime());
  return{ 
    pid, 
    title,
     nodeVerion,
      uptime,
  cwd: process.cwd(),
  memoryUsage: {
    rss: formatBytes(process.memoryUsage().rss),
    heaptotal: formatBytes(process.memoryUsage().heapTotal),
    heapUsed: formatBytes(process.memoryUsage().heapUsed),
    external: formatBytes(process.memoryUsage().external),
  },
  env: {
    NODE_ENV: process.env.NODE_ENV || "Not Set",
  }
}
};
//! HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  res.setHeader("Content-Type", "application/json");
  if (parsedUrl.pathname === "/") {
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        name: "SysView-System Info Api",
        description: "Access System stats via simple JSON Routes",
        routes: ["/cpu","/cputemp", "/memory", "/user", "/process", "/network","/battery"],
      }),
    );
  }
  else if(parsedUrl.pathname==="/cpu"){
    res.end(JSON.stringify(getCPUInfo(),null,2));
  }
  else if(parsedUrl.pathname==="/battery"){
   getBatteryInfo().then((data) => {
     res.end(JSON.stringify(data, null, 2));
   });
  }
  else if(parsedUrl.pathname==="/memory"){
    res.end(JSON.stringify(getmemoryinfo(),null,2));
  }
  else if(parsedUrl.pathname==="/user"){
    res.end(JSON.stringify(getUserInfo(),null,2));
  }
  else if(parsedUrl.pathname==="/process"){
    res.end(JSON.stringify(getProcess(),null,2));
  }
  else if(parsedUrl.pathname==="/os"){
    res.end(JSON.stringify(getOsInfo(),null,2));
  }
 
  else if(parsedUrl.pathname==="/network"){
    res.end(JSON.stringify(getNetworkInfo(),null,2));
  }
  else{
    res.statusCode=404;
    res.end(
        JSON.stringify({
            result:'Routes Not Found'

        })
    )
  }
});
//!Server Start
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`System is running at http://localhost:${PORT}`);
})

