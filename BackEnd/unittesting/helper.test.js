process.env.SUPABASE_URL = 'http://test.com';
process.env.SUPABASE_SECRET_KEY = 'test';
process.env.GOOGLE_CLIENT_ID = 'id';
process.env.GOOGLE_CLIENT_SECRET = 'secret';
process.env.GOOGLE_REDIRECT_URI = 'uri';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'path' }, error: null }),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'http://pub.url' } }))
      }))
    }
  }))
}));

const helper = require('../utils/helper');

describe('Helper Utils', () => {
  describe('encode/decode', () => {
    it('should encode string to base64', () => {
      const str = 'hello';
      const encoded = helper.encode(str);
      expect(encoded).toBe(Buffer.from(str).toString('base64'));
    });

    it('should decode base64 to string', () => {
      const str = 'hello';
      const encoded = Buffer.from(str).toString('base64');
      const decoded = helper.decode(encoded);
      expect(decoded).toBe(str);
    });

    it('should return undefined for null encode', () => {
      expect(helper.encode(null)).toBeUndefined();
    });

    it('should return null for null decode', () => {
      expect(helper.decode(null)).toBeNull();
    });
  });

  describe('extractJSON', () => {
    it('should extract JSON from markdown block', () => {
      const text = '```json\n{"a": 1}\n```';
      expect(helper.extractJSON(text)).toEqual({ a: 1 });
    });

    it('should extract JSON from plain text with braces', () => {
      const text = 'Result: {"b": 2} extra';
      expect(helper.extractJSON(text)).toEqual({ b: 2 });
    });

    it('should throw error for invalid JSON', () => {
      expect(() => helper.extractJSON('no json here')).toThrow('Invalid JSON format from AI');
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const file = { originalname: 't.png', buffer: Buffer.from(''), mimetype: 'image/png' };
      const result = await helper.uploadImage(file, 'u1');
      expect(result.status).toBe('success');
    });
  });

  describe('getOAuthClient', () => {
    it('should return OAuth2 client', () => {
      const client = helper.getOAuthClient();
      expect(client).toBeDefined();
    });
  });
});
