import { redis } from './src/client';

async function testRedisConnection() {
  try {
    console.log('Testing Redis connection...');
    
    // Test basic connectivity
    const pingResult = await redis.ping();
    console.log('✅ Redis ping successful:', pingResult);
    
    // Test set/get operations
    const testKey = 'test:connection';
    const testValue = JSON.stringify({ timestamp: new Date().toISOString(), message: 'Hello Redis!' });
    
    const setResult = await redis.set(testKey, testValue, 60); // 60 seconds TTL
    console.log('✅ Redis SET successful:', setResult);
    
    const getValue = await redis.get(testKey);
    console.log('✅ Redis GET successful:', getValue);
    
    // Test health check
    const isHealthy = await redis.isHealthy();
    console.log('✅ Redis health check:', isHealthy);
    
    // Cleanup
    const deleted = await redis.del(testKey);
    console.log('✅ Redis DEL successful:', deleted);
    
    console.log('\n🎉 All Redis operations successful!');
    
    // Disconnect
    await redis.disconnect();
    console.log('✅ Redis disconnected');
    
  } catch (error) {
    console.error('❌ Redis connection test failed:', error);
    process.exit(1);
  }
}

testRedisConnection();
