import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import fs from 'fs';
import path from 'path';
import os from "os";
const homedir = os.homedir();
const apiRoutes = ["^/api/v1/", "/health"];

// Use environment variable to determine the target.
const target = process.env.VITE_PROXY_TARGET || "http://127.0.0.1:7860";

// Use environment variable to determine the UI server port 
const port = process.env.VITE_PORT || 80;
// const port = process.env.VITE_PORT || 443;

const proxyTargets = apiRoutes.reduce((proxyObj, route) => {
  proxyObj[route] = {
    target: target,
    changeOrigin: true,
    secure: false,
    ws: true,
  };
  return proxyObj;
}, {});
export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    plugins: [react(), svgr()],
    server: {
      port: port,
      proxy: {
        ...proxyTargets,
      },
      // https:{
      //   key:fs.readFileSync(path.resolve(`${homedir}/.cert/neuri.online.key`)),
      //   cert:fs.readFileSync(path.resolve(`${homedir}/.cert/neuri.online_public.crt`)),
      //   ca:fs.readFileSync(path.resolve(`${homedir}/.cert/neuri.online_chain.crt`))
      // }
    },
  };
});
