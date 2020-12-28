import express from 'express';
import fs from 'fs';
import getPort from 'get-port';
import os from 'os';
import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import {webpackConfig} from './webpack-config';

export const startServer = async (
	entry: string,
	userDefinedComponent: string
): Promise<number> => {
	const app = express();
	const tmpDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'react-motion-graphics')
	);

	const config = webpackConfig({
		entry,
		userDefinedComponent,
		outDir: tmpDir,
		environment: 'development',
	});
	const compiler = webpack(config);

	app.use(express.static(path.join(__dirname, '..', 'web')));
	app.use(webpackDevMiddleware(compiler));
	app.use(
		webpackHotMiddleware(compiler, {
			path: '/__webpack_hmr',
			heartbeat: 10 * 1000,
		})
	);

	app.use('*', (req, res) => {
		res.sendFile(path.join(__dirname, '..', 'web', 'index.html'));
	});

	const port = await getPort({port: getPort.makeRange(3000, 3100)});
	app.listen(port);
	return port;
};

export * from './bundler';