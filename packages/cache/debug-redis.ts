import { createClient } from 'redis';
import { config } from 'dotenv';

// Load environment variables from .env file
config({ path: '../../.env' });

async function debugRedisConnection() {
  console.log('🔍 Redis Connection Debug');
  console.log('========================');
  
  // Read environment variables
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;
  const password = process.env.REDIS_PASSWORD;
  const username = process.env.REDIS_USERNAME;
  const db = process.env.REDIS_DB;
  
  console.log('Environment Variables:');
  console.log(`  REDIS_HOST: ${host}`);
  console.log(`  REDIS_PORT: ${port}`);
  console.log(`  REDIS_USERNAME: ${username}`);
  console.log(`  REDIS_PASSWORD: ${password ? '***masked***' : 'not set'}`);
  console.log(`  REDIS_DB: ${db}`);
  console.log('');

  if (!host || !port || !password) {
    console.error('❌ Missing required Redis environment variables');
    console.log('Required: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD');
    return;
  }

  // Try different connection methods
  const connectionMethods = [
    {
      name: 'Redis Cloud URL Format',
      config: {
        url: `redis://${username || 'default'}:${password}@${host}:${port}/${db || '0'}`
      }
    },
    {
      name: 'Socket Configuration',
      config: {
        socket: {
          host: host,
          port: Number(port),
          connectTimeout: 10000,
        },
        username: username || 'default',
        password: password,
        database: Number(db || '0')
      }
    },
    {
      name: 'Legacy Format',
      config: {
        host: host,
        port: Number(port),
        password: password,
        username: username || 'default',
        db: Number(db || '0')
      }
    }
  ];

  for (const method of connectionMethods) {
    console.log(`🧪 Testing: ${method.name}`);
    console.log(`Config: ${JSON.stringify(method.config, null, 2)}`);
    
    let client;
    try {
      client = createClient(method.config);
      
      client.on('error', (err) => {
        console.log(`  ❌ Error: ${err.message}`);
      });

      client.on('connect', () => {
        console.log('  ✅ Connected successfully!');
      });

      await client.connect();
      
      const pingResult = await client.ping();
      console.log(`  ✅ Ping successful: ${pingResult}`);
      
      await client.disconnect();
      console.log('  ✅ Disconnected successfully');
      console.log('  🎉 This connection method works!');
      break;
      
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      if (client) {
        try {
          await client.disconnect();
        } catch (e) {
          // Ignore disconnect errors
        }
      }
    }
    console.log('');
  }
}

debugRedisConnection().catch(console.error);
