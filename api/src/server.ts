import { app } from './app';
import { env } from './config';

app.listen(env.PORT, () => console.log(`API listening on port ${env.PORT}`));
