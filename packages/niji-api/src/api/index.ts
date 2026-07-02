import { Hono } from 'hono';
import { graphql } from 'ponder';
import { db } from 'ponder:api';
import schema from 'ponder:schema';

import { createSpotRateApp } from '../handlers/spot-rate.js';

const app = new Hono();

app.use('/', graphql({ db, schema }));
app.use('/graphql', graphql({ db, schema }));

// Issue #3005 — GET /api/v1/spot-rate/eth-jpy (ETH/JPY spot rate 取得)
app.route('/api/v1/spot-rate', createSpotRateApp());

export default app;
