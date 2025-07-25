import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { defaultsDeep, pick } from 'lodash-es';

export default {
  // start http server for RELEASE mode (vite provides server for dev)
  startHttpServer(port = 5000) {
    console.info('riv> starting http server in RELEASE mode');
    let server = http.createServer().listen(port, () => {
      console.log(`riv> http listening on port ${port}`);
    });
    // set up handler to serve app files
    server.on('request', (req, res) => {
      let filePath = './index.html';
      var contentType = 'text/html';
      // handle exceptions
      if (req.url?.endsWith('.ttf')) {
        contentType = 'application/octet-stream';
        filePath = req.url;
      } else if (req.url === '/favicon.ico') {
        contentType = 'image/x-icon';
        filePath = req.url;
      } else if (req.url === '/logo.png') {
        contentType = 'image/png';
        filePath = req.url;
      } else if (req.url?.startsWith('/assets')) {
        filePath = `.${req.url}`;
        let ext = path.extname(filePath);
        contentType = 'text/html';
        switch (ext) {
          case '.js':
            contentType = 'text/javascript';
            break;
          case '.css':
            contentType = 'text/css';
            break;
          case '.json':
            contentType = 'application/json';
            break;
          case '.png':
            contentType = 'image/png';
            break;
          case '.jpg':
            contentType = 'image/jpg';
            break;
        }
      } else if (req.url?.startsWith('/socket.io')) {
        return; // do nothing, let socket.io take over
      }
      let fullPath = path.join('dist', filePath);
      fs.readFile(fullPath, function(error, content) {
        if (error) {
          if (error.code == 'ENOENT'){
            res.writeHead(404);
            res.end('riv> file not found');
          } else {
            res.writeHead(500);
            res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });
    return server;
  },
  //
  // helper to set a value deep in an object using dot path
  //
  deepSet(obj: any, path: string, value: any) {
    let a = path.split('.');
    let o = obj;
    while (a.length - 1) {
      let n = a.shift();
      if (n === undefined) {
        throw new Error(`riv> deepSet: invalid path ${path}`);
      }
      // if the object doesn't have this property, create it
      if (!(n in o)) {
        o[n] = {};
      }
      o = o[n];
    }
    // check for basic type primitives and coerce
    switch (typeof o[a[0]]) {
      case 'number':
        o[a[0]] = parseFloat(value);
        break;
      case 'boolean':
        o[a[0]] = value === 'true';
        break;
      case 'object':
        o[a[0]] = JSON.parse(value);
        break;
      default: // string, etc.
        o[a[0]] = value;
        break;
    }
  },
  //
  // function to look in a bunch of places to find modules called out in riv.config
  //
  async findModule(root: string, relPath: string) {
    // worker function to try all path variations
    let tryFindModule = async (root: string, relPath: string) => {
      let mod;
      let modPath = relPath;
      let errors = []; // collect errors
      // 1. try relative path
      try {
        mod = await import(pathToFileURL(`./${relPath}`).toString());
      } catch (e) {
        errors.push(e);
      }
      // 2. try relative to riv server folder
      if (!mod) {
        try {
          modPath = path.resolve(this.findRoot(), 'server', relPath);
          mod = await import(pathToFileURL(modPath).toString());
        } catch (e) {
          errors.push(e);
        }
      }
      // 3. try relative to parent project root
      if (!mod) {
        try {
          modPath = path.resolve(root, relPath);
          mod = await import(pathToFileURL(modPath).toString());
        } catch (e) {
          errors.push(e);
        }
      }
      // 4. try node_modules in nearest root, this handles cases where riv is a dep
      if (!mod) {
        try {
          modPath = path.resolve(this.findRoot(), 'node_modules/riv/server', relPath);
          mod = await import(pathToFileURL(modPath).toString());
        } catch (e) {
          errors.push(e);
        }
      }
      return {
        mod,
        modPath,
        errors,
      };
    };

    let mod, modPath;
    let errors1: any[] = [];
    let errors2: any[] = [];
    // 1. try adding .ts extension if not there (ES6 doesn't allow us to import without an extension 😢 ))
    let tsPath = relPath;
    if (tsPath.lastIndexOf('.') < 0) {
      tsPath += '.ts';
    }
    ({ mod, modPath, errors: errors1 } = await tryFindModule(root, tsPath));
    // 2. if .ts didn't work, try adding /index.ts in case it's a folder with index.ts inside
    if (!mod) {
      // try adding /index.ts in case it is a dir module
      let idxPath = `${relPath}/index.ts`;
      ({ mod, modPath, errors: errors2 } = await tryFindModule(root, idxPath));
    }
    return {
      mod,
      modPath,
      errors: [ ...errors1, ...errors2 ], // aggregate all errors
    };
  },
  __dirname() {
    return path.dirname(fileURLToPath(import.meta.url));
  },
  findRoot(p: string = ''): string {
    if (p.length === 0) {
      p = this.__dirname();
    }
    // console.log(`riv> findRoot starting in ${p}`);
    var rpath = path.resolve(p);
    if (fs.existsSync(path.join(rpath, 'package.json'))) {
      // console.log(`riv> findRoot found package.json in ${p}`);
      return rpath;
    } else {
      var parent = path.dirname(rpath);
      // console.log(`riv> findRoot traversing up to ${parent}`);
      if (parent !== rpath) {
        return this.findRoot(parent);
      } else { // failsafe - means we got all the way to root
        // if a parent root cannot be found, naively default to using our own root
        return this.__dirname();
      }
    }
  },
  findFiles(p: string, ext = '.ts') {
    //@ts-ignore
    return fs.globSync(`${p}/**/*${ext}`);
  },
  async findClasses(p: string) {
    let ret = {};
    let files = this.findFiles(p);
    for (let f of files) {
      let cls = await import(pathToFileURL(f).toString());
      let name = Object.keys(cls)[0];
      (ret as any)[name] = cls[name];
    }
    return ret;
  },
};
