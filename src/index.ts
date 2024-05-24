import server from './server';
import colors from 'colors';
import signale from 'signale';

const port = process.env.PORT || 4000;

server.listen(port, () => {
	try {
		console.log(signale.start(colors.bgGreen.white.bold(`Server is running on port ${port}`)));
	} catch (error) {
		console.log(signale.error(colors.bgRed.white.bold(`Server is NOT running on port ${port}`)));
	}
});