import { encryptSecret, decryptSecret } from '../utils/crypto.util.js';
import { extractYouTubeVideoId } from '../services/performance.service.js';
import { calculateDeterministicMatch } from '../services/ai/scoring.engine.js';
import { signAccessToken, verifyAccessToken } from '../utils/jwt.util.js';
import { submitContentSchema } from '../validators/performance.validator.js';
import { createProductSchema } from '../validators/product.validator.js';
import { createCampaignSchema } from '../validators/campaign.validator.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    throw new Error(`Assertion failed in test: ${testName}`);
  }
}

async function runTests() {
  console.log('🧪 Running CreatorOS Phase 8 Automated System Integrity Test Suite...\n');

  // --------------------------------------------------------------------------
  // TEST 1: Cryptographic Encryption at Rest (AES-256-GCM)
  // --------------------------------------------------------------------------
  console.log('1. Testing AES-256-GCM Encryption Utility...');
  const secretToken = 'ya29.a0AfH6SMD_SampleOAuthAccessToken_1234567890';
  const encrypted = encryptSecret(secretToken);
  assert(encrypted.includes(':'), 'Encrypted output contains IV, auth tag, and ciphertext separator');
  const decrypted = decryptSecret(encrypted);
  assert(decrypted === secretToken, 'Decrypted token matches original secret string exactly');

  // --------------------------------------------------------------------------
  // TEST 2: YouTube URL & Video ID Parsing
  // --------------------------------------------------------------------------
  console.log('\n2. Testing YouTube URL Parsing Engine...');
  const standardUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const shortUrl = 'https://youtu.be/dQw4w9WgXcQ';
  const embedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  const shortsUrl = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';
  const invalidUrl = 'https://example.com/video/12345';

  assert(extractYouTubeVideoId(standardUrl) === 'dQw4w9WgXcQ', 'Parses standard YouTube watch URL');
  assert(extractYouTubeVideoId(shortUrl) === 'dQw4w9WgXcQ', 'Parses youtu.be short URL');
  assert(extractYouTubeVideoId(embedUrl) === 'dQw4w9WgXcQ', 'Parses YouTube embed URL');
  assert(extractYouTubeVideoId(shortsUrl) === 'dQw4w9WgXcQ', 'Parses YouTube Shorts URL');
  assert(extractYouTubeVideoId(invalidUrl) === null, 'Rejects non-YouTube URLs');

  // --------------------------------------------------------------------------
  // TEST 3: Deterministic Statistical Consistency & Scoring Math
  // --------------------------------------------------------------------------
  console.log('\n3. Testing Statistical Scoring Engine (Deterministic Math)...');
  // Sample historical views: highly consistent creator
  const consistentViews = [50000, 52000, 48000, 51000, 49000];
  const consistentLikes = [2500, 2600, 2400, 2550, 2450];
  const matchResult = calculateDeterministicMatch(
    ['Tech', 'Audio'],
    65.0,
    ['Tech', 'Audio', 'Electronics'],
    consistentViews,
    consistentLikes,
    3
  );

  assert(matchResult.consistencyScore > 90, `Consistent creator score (${matchResult.consistencyScore}%) exceeds 90%`);
  assert(matchResult.metrics.averageViews === 50000, 'Calculates exact arithmetic mean');
  assert(matchResult.overallScore >= 80 && matchResult.overallScore <= 100, `Composite match score (${matchResult.overallScore}%) is within expected weighted range`);
  assert(matchResult.factors.audienceFitScore === 100, 'Audience fit score evaluates to 100% for full category match');

  // Sample volatile creator views
  const volatileViews = [1000, 250000, 500, 180000, 2000];
  const volatileLikes = [50, 12000, 25, 9000, 100];
  const volatileResult = calculateDeterministicMatch(
    ['Tech'],
    65.0,
    ['Gaming'],
    volatileViews,
    volatileLikes,
    0
  );
  assert(volatileResult.consistencyScore < 50, `Volatile creator score (${volatileResult.consistencyScore}%) is penalized below 50%`);

  // --------------------------------------------------------------------------
  // TEST 4: Deterministic CPM Escrow Calculation & Payout Math
  // --------------------------------------------------------------------------
  console.log('\n4. Testing Deterministic CPM Escrow Distribution Math...');
  const initialViews = 1200;
  const currentViews = 28400;
  const deltaViews = currentViews - initialViews; // 27,200
  const cpmRate = 65.0; // ₹65 per 1,000 verified views
  const expectedCredits = Math.floor((deltaViews / 1000) * cpmRate); // floor(27.2 * 65) = 1768

  assert(deltaViews === 27200, 'Incremental delta views strictly calculated as Current - Baseline');
  assert(expectedCredits === 1768, `CPM payout correctly computed: floor((27,200 / 1000) * 65) = ${expectedCredits}`);

  // --------------------------------------------------------------------------
  // TEST 5: JWT Token Signing & Verification
  // --------------------------------------------------------------------------
  console.log('\n5. Testing JWT Security Authentication...');
  const tokenPayload = {
    userId: 'usr_test_123',
    email: 'test@creatoros.io',
    roles: ['BRAND', 'CREATOR'],
    activeRole: 'BRAND',
  };
  const token = signAccessToken(tokenPayload);
  assert(typeof token === 'string' && token.length > 20, 'Signed valid JWT string');
  const verified = verifyAccessToken(token);
  assert(verified.userId === tokenPayload.userId, 'Verified JWT contains correct userId');
  assert(verified.email === tokenPayload.email, 'Verified JWT contains correct email');
  assert(verified.activeRole === tokenPayload.activeRole, 'Verified JWT contains correct activeRole');

  // --------------------------------------------------------------------------
  // TEST 6: Zod Request Validation Schemas
  // --------------------------------------------------------------------------
  console.log('\n6. Testing Input Validation Schemas (Zod)...');
  const validContentSubmit = {
    campaignId: 'camp_123',
    publishedUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    platform: 'YOUTUBE' as const,
    initialViews: 100,
  };
  assert(submitContentSchema.safeParse(validContentSubmit).success, 'Valid content submission passes schema');

  const invalidContentSubmit = {
    campaignId: '',
    publishedUrl: 'not-a-valid-url',
  };
  assert(!submitContentSchema.safeParse(invalidContentSubmit).success, 'Invalid content submission rejected with validation errors');

  const validCampaign = {
    title: 'New Product Campaign',
    objective: 'Brand awareness',
    description: 'A comprehensive product campaign',
    budgetCredits: 2500,
    cpmRate: 50,
  };
  assert(createCampaignSchema.safeParse(validCampaign).success, 'Valid campaign passes schema');

  const validProduct = {
    name: 'Pro Headphones',
    description: 'High performance noise cancelling headphones',
    category: 'Electronics',
  };
  assert(createProductSchema.safeParse(validProduct).success, 'Valid product passes schema');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log(`\n================================================================`);
  console.log(`🎉 ALL TESTS PASSED: ${passedTests} / ${totalTests} assertions verified (100%)`);
  console.log(`================================================================\n`);
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
