import { z } from 'zod';
import { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.DbNull;
  if (v === 'JsonNull') return Prisma.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.function(z.tuple([]), z.any()) }),
    z.record(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;

// DECIMAL
//------------------------------------------------------

export const DecimalJsLikeSchema: z.ZodType<Prisma.DecimalJsLike> = z.object({
  d: z.array(z.number()),
  e: z.number(),
  s: z.number(),
  toFixed: z.function(z.tuple([]), z.string()),
})

export const DECIMAL_STRING_REGEX = /^(?:-?Infinity|NaN|-?(?:0[bB][01]+(?:\.[01]+)?(?:[pP][-+]?\d+)?|0[oO][0-7]+(?:\.[0-7]+)?(?:[pP][-+]?\d+)?|0[xX][\da-fA-F]+(?:\.[\da-fA-F]+)?(?:[pP][-+]?\d+)?|(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?))$/;

export const isValidDecimalInput =
  (v?: null | string | number | Prisma.DecimalJsLike): v is string | number | Prisma.DecimalJsLike => {
    if (v === undefined || v === null) return false;
    return (
      (typeof v === 'object' && 'd' in v && 'e' in v && 's' in v && 'toFixed' in v) ||
      (typeof v === 'string' && DECIMAL_STRING_REGEX.test(v)) ||
      typeof v === 'number'
    )
  };

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const AiChatScalarFieldEnumSchema = z.enum(['id','organizationId','userId','title','messages','createdAt','updatedAt']);

export const PurchaseScalarFieldEnumSchema = z.enum(['id','organizationId','userId','type','customerId','subscriptionId','productId','status','createdAt','updatedAt']);

export const ServiceCategoryScalarFieldEnumSchema = z.enum(['id','name','description']);

export const AccountScalarFieldEnumSchema = z.enum(['id','accountId','providerId','userId','accessToken','refreshToken','idToken','expiresAt','password','accessTokenExpiresAt','refreshTokenExpiresAt','scope','createdAt','updatedAt']);

export const BookingScalarFieldEnumSchema = z.enum(['id','studentId','providerId','serviceId','status','dateTime','createdAt','updatedAt']);

export const InvitationScalarFieldEnumSchema = z.enum(['id','organizationId','email','role','status','expiresAt','inviterId']);

export const MemberScalarFieldEnumSchema = z.enum(['id','organizationId','userId','role','createdAt']);

export const OrganizationScalarFieldEnumSchema = z.enum(['id','name','slug','logo','createdAt','metadata','paymentsCustomerId']);

export const PasskeyScalarFieldEnumSchema = z.enum(['id','name','publicKey','userId','credentialID','counter','deviceType','backedUp','transports','createdAt']);

export const PaymentScalarFieldEnumSchema = z.enum(['id','amount','currency','status','provider','transactionRef','paymentMethod','bookingId','providerId','escrowStatus','metadata','createdAt','updatedAt']);

export const Payout_accountScalarFieldEnumSchema = z.enum(['id','userId','provider','accountNumber','accountName','bankCode','bankName','isDefault','metadata','createdAt','updatedAt']);

export const ReviewScalarFieldEnumSchema = z.enum(['id','rating','comment','bookingId','authorId','targetId','createdAt','updatedAt']);

export const ServiceScalarFieldEnumSchema = z.enum(['id','name','description','price','duration','providerId','createdAt','updatedAt','isActive','categoryId']);

export const SessionScalarFieldEnumSchema = z.enum(['id','expiresAt','ipAddress','userAgent','userId','impersonatedBy','activeOrganizationId','token','createdAt','updatedAt']);

export const SlotScalarFieldEnumSchema = z.enum(['id','userId','dayOfWeek','startTime','endTime','isAvailable']);

export const UserScalarFieldEnumSchema = z.enum(['id','name','email','emailVerified','image','createdAt','updatedAt','username','role','banned','banReason','banExpires','onboardingComplete','paymentsCustomerId','locale','userType','matricNumber','department','level','verified','verificationDoc','isStudentVerified','isVerified','studentIdCardUrl','verificationNotes','verificationReviewedAt','verificationReviewedBy','verificationStatus','providerCategory','providerVerificationDocs']);

export const VerificationScalarFieldEnumSchema = z.enum(['id','identifier','value','expiresAt','createdAt','updatedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const NullableJsonNullValueInputSchema = z.enum(['DbNull','JsonNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.JsonNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const NullsOrderSchema = z.enum(['first','last']);

export const BookingStatusSchema = z.enum(['PENDING','CONFIRMED','COMPLETED','CANCELLED','REFUNDED']);

export type BookingStatusType = `${z.infer<typeof BookingStatusSchema>}`

export const EscrowStatusSchema = z.enum(['HELD','RELEASED','REFUNDED']);

export type EscrowStatusType = `${z.infer<typeof EscrowStatusSchema>}`

export const PaymentProviderSchema = z.enum(['PAYSTACK','FLUTTERWAVE']);

export type PaymentProviderType = `${z.infer<typeof PaymentProviderSchema>}`

export const PaymentStatusSchema = z.enum(['PENDING','PROCESSING','COMPLETED','FAILED','REFUNDED','DISPUTED']);

export type PaymentStatusType = `${z.infer<typeof PaymentStatusSchema>}`

export const PurchaseTypeSchema = z.enum(['SUBSCRIPTION','ONE_TIME']);

export type PurchaseTypeType = `${z.infer<typeof PurchaseTypeSchema>}`

export const UserTypeSchema = z.enum(['STUDENT','PROVIDER','ADMIN']);

export type UserTypeType = `${z.infer<typeof UserTypeSchema>}`

export const VerificationStatusSchema = z.enum(['PENDING','APPROVED','REJECTED']);

export type VerificationStatusType = `${z.infer<typeof VerificationStatusSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// AI CHAT SCHEMA
/////////////////////////////////////////

export const AiChatSchema = z.object({
  id: z.string(),
  organizationId: z.string().nullable(),
  userId: z.string().nullable(),
  title: z.string().nullable(),
  messages: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AiChat = z.infer<typeof AiChatSchema>

/////////////////////////////////////////
// PURCHASE SCHEMA
/////////////////////////////////////////

export const PurchaseSchema = z.object({
  type: PurchaseTypeSchema,
  id: z.string(),
  organizationId: z.string().nullable(),
  userId: z.string().nullable(),
  customerId: z.string(),
  subscriptionId: z.string().nullable(),
  productId: z.string(),
  status: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Purchase = z.infer<typeof PurchaseSchema>

/////////////////////////////////////////
// SERVICE CATEGORY SCHEMA
/////////////////////////////////////////

export const ServiceCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
})

export type ServiceCategory = z.infer<typeof ServiceCategorySchema>

/////////////////////////////////////////
// ACCOUNT SCHEMA
/////////////////////////////////////////

export const accountSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
  idToken: z.string().nullable(),
  expiresAt: z.coerce.date().nullable(),
  password: z.string().nullable(),
  accessTokenExpiresAt: z.coerce.date().nullable(),
  refreshTokenExpiresAt: z.coerce.date().nullable(),
  scope: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type account = z.infer<typeof accountSchema>

/////////////////////////////////////////
// BOOKING SCHEMA
/////////////////////////////////////////

/**
 * This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
 */
export const bookingSchema = z.object({
  status: BookingStatusSchema,
  id: z.string(),
  studentId: z.string(),
  providerId: z.string(),
  serviceId: z.string(),
  dateTime: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type booking = z.infer<typeof bookingSchema>

/////////////////////////////////////////
// INVITATION SCHEMA
/////////////////////////////////////////

export const invitationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string(),
  role: z.string().nullable(),
  status: z.string(),
  expiresAt: z.coerce.date(),
  inviterId: z.string(),
})

export type invitation = z.infer<typeof invitationSchema>

/////////////////////////////////////////
// MEMBER SCHEMA
/////////////////////////////////////////

export const memberSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.coerce.date(),
})

export type member = z.infer<typeof memberSchema>

/////////////////////////////////////////
// ORGANIZATION SCHEMA
/////////////////////////////////////////

export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullable(),
  logo: z.string().nullable(),
  createdAt: z.coerce.date(),
  metadata: z.string().nullable(),
  paymentsCustomerId: z.string().nullable(),
})

export type organization = z.infer<typeof organizationSchema>

/////////////////////////////////////////
// PASSKEY SCHEMA
/////////////////////////////////////////

export const passkeySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  publicKey: z.string(),
  userId: z.string(),
  credentialID: z.string(),
  counter: z.number().int(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().nullable(),
  createdAt: z.coerce.date().nullable(),
})

export type passkey = z.infer<typeof passkeySchema>

/////////////////////////////////////////
// PAYMENT SCHEMA
/////////////////////////////////////////

/**
 * This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
 */
export const paymentSchema = z.object({
  status: PaymentStatusSchema,
  provider: PaymentProviderSchema,
  escrowStatus: EscrowStatusSchema.nullable(),
  id: z.string(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'payment']"}),
  currency: z.string(),
  transactionRef: z.string(),
  paymentMethod: z.string(),
  bookingId: z.string(),
  providerId: z.string(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type payment = z.infer<typeof paymentSchema>

/////////////////////////////////////////
// PAYOUT ACCOUNT SCHEMA
/////////////////////////////////////////

export const payout_accountSchema = z.object({
  provider: PaymentProviderSchema,
  id: z.string(),
  userId: z.string(),
  accountNumber: z.string(),
  accountName: z.string(),
  bankCode: z.string(),
  bankName: z.string(),
  isDefault: z.boolean(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type payout_account = z.infer<typeof payout_accountSchema>

/////////////////////////////////////////
// REVIEW SCHEMA
/////////////////////////////////////////

/**
 * This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
 */
export const reviewSchema = z.object({
  id: z.string(),
  rating: z.number().int(),
  comment: z.string().nullable(),
  bookingId: z.string(),
  authorId: z.string(),
  targetId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type review = z.infer<typeof reviewSchema>

/////////////////////////////////////////
// SERVICE SCHEMA
/////////////////////////////////////////

/**
 * This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
 */
export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.instanceof(Prisma.Decimal, { message: "Field 'price' must be a Decimal. Location: ['Models', 'service']"}),
  duration: z.number().int(),
  providerId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isActive: z.boolean(),
  categoryId: z.string(),
})

export type service = z.infer<typeof serviceSchema>

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const sessionSchema = z.object({
  id: z.string(),
  expiresAt: z.coerce.date(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  userId: z.string(),
  impersonatedBy: z.string().nullable(),
  activeOrganizationId: z.string().nullable(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type session = z.infer<typeof sessionSchema>

/////////////////////////////////////////
// SLOT SCHEMA
/////////////////////////////////////////

export const slotSchema = z.object({
  id: z.string(),
  userId: z.string(),
  dayOfWeek: z.number().int(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  isAvailable: z.boolean(),
})

export type slot = z.infer<typeof slotSchema>

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

/**
 * This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
 */
export const userSchema = z.object({
  userType: UserTypeSchema.nullable(),
  verificationStatus: VerificationStatusSchema.nullable(),
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().nullable(),
  role: z.string().nullable(),
  banned: z.boolean().nullable(),
  banReason: z.string().nullable(),
  banExpires: z.coerce.date().nullable(),
  onboardingComplete: z.boolean(),
  paymentsCustomerId: z.string().nullable(),
  locale: z.string().nullable(),
  matricNumber: z.string().nullable(),
  department: z.string().nullable(),
  level: z.number().int().nullable(),
  verified: z.boolean(),
  verificationDoc: z.string().nullable(),
  isStudentVerified: z.boolean(),
  isVerified: z.boolean(),
  studentIdCardUrl: z.string().nullable(),
  verificationNotes: z.string().nullable(),
  verificationReviewedAt: z.coerce.date().nullable(),
  verificationReviewedBy: z.string().nullable(),
  providerCategory: z.string().nullable(),
  providerVerificationDocs: JsonValueSchema.nullable(),
})

export type user = z.infer<typeof userSchema>

/////////////////////////////////////////
// VERIFICATION SCHEMA
/////////////////////////////////////////

export const verificationSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
})

export type verification = z.infer<typeof verificationSchema>
