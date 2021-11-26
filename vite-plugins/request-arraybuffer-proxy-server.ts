import {PluginOption} from 'vite';
import urlParse from 'url-parse';
import axios from 'axios';

export default function (routePath: string): PluginOption {
    return {
        name: 'request-arraybuffer-proxy-server',
        configureServer(server) {
            server.middlewares.use(routePath, async function (req, res) {
                try {
                    const url = urlParse(req.url || '/').pathname.slice(1);
                    const clientRes = await axios.get(url, {
                        responseType: 'arraybuffer'
                    });
                    res.writeHead(clientRes.status);
                    res.write(clientRes.data);
                    res.end();
                } catch (e) {
                    console.error(e);
                    res.writeHead(500);
                    if (e instanceof Error) {
                        res.write(e.message);
                    }
                    res.end();
                }
            });
        }
    };
};