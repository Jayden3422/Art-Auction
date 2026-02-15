import judge from '../tools/judge.js';

describe('judge - input validation utilities', () => {
    describe('isPhone', () => {
        test('accepts valid Chinese phone numbers', () => {
            expect(judge.isPhone('13800138000')).toBe(true);
            expect(judge.isPhone('15912345678')).toBe(true);
            expect(judge.isPhone('18600000000')).toBe(true);
            expect(judge.isPhone('17700001111')).toBe(true);
        });

        test('rejects numbers not starting with 1', () => {
            expect(judge.isPhone('23800138000')).toBe(false);
            expect(judge.isPhone('03800138000')).toBe(false);
        });

        test('rejects numbers with wrong length', () => {
            expect(judge.isPhone('1380013800')).toBe(false);   // 10 digits
            expect(judge.isPhone('138001380001')).toBe(false);  // 12 digits
        });

        test('rejects non-numeric input', () => {
            expect(judge.isPhone('abcdefghijk')).toBe(false);
            expect(judge.isPhone('')).toBe(false);
        });
    });

    describe('isMail', () => {
        test('accepts valid email addresses', () => {
            expect(judge.isMail('test@example.com')).toBe(true);
            expect(judge.isMail('user.name@domain.org')).toBe(true);
            expect(judge.isMail('user-name@sub.domain.co')).toBe(true);
        });

        test('rejects invalid email addresses', () => {
            expect(judge.isMail('test')).toBe(false);
            expect(judge.isMail('test@')).toBe(false);
            expect(judge.isMail('@domain.com')).toBe(false);
            expect(judge.isMail('')).toBe(false);
        });
    });

    describe('isDate', () => {
        test('accepts valid YYYY-MM-DD dates', () => {
            expect(judge.isDate('2024-01-15')).toBe(true);
            expect(judge.isDate('2024-1-5')).toBe(true);
            expect(judge.isDate('2024-12-31')).toBe(true);
        });

        test('rejects invalid date formats', () => {
            expect(judge.isDate('01-15-2024')).toBe(false);
            expect(judge.isDate('2024/01/15')).toBe(false);
            expect(judge.isDate('')).toBe(false);
            expect(judge.isDate('abc')).toBe(false);
        });
    });

    describe('isQQ', () => {
        test('accepts valid QQ numbers (5-11 digits starting with non-zero)', () => {
            expect(judge.isQQ('12345')).toBe(true);
            expect(judge.isQQ('1234567890')).toBe(true);
            expect(judge.isQQ('12345678901')).toBe(true);
        });

        test('rejects QQ numbers too short or too long', () => {
            expect(judge.isQQ('1234')).toBe(false);          // 4 digits
            expect(judge.isQQ('123456789012')).toBe(false);   // 12 digits
        });

        test('rejects QQ numbers starting with 0', () => {
            expect(judge.isQQ('01234')).toBe(false);
        });

        test('rejects non-numeric input', () => {
            expect(judge.isQQ('abcde')).toBe(false);
            expect(judge.isQQ('')).toBe(false);
        });
    });

    describe('isWechat', () => {
        test('accepts valid WeChat IDs (6-20 chars, starts with letter)', () => {
            expect(judge.isWechat('abcdef')).toBe(true);
            expect(judge.isWechat('user_123')).toBe(true);
            expect(judge.isWechat('wx-user-name')).toBe(true);
            expect(judge.isWechat('A12345')).toBe(true);
        });

        test('rejects IDs shorter than 6 characters', () => {
            expect(judge.isWechat('abcde')).toBe(false);
            expect(judge.isWechat('a')).toBe(false);
        });

        test('accepts longer IDs (regex group repeats via +)', () => {
            // The regex uses + on the group, so lengths > 20 are still valid
            expect(judge.isWechat('a' + 'b'.repeat(20))).toBe(true);
        });

        test('rejects IDs not starting with a letter', () => {
            expect(judge.isWechat('1abcde')).toBe(false);
            expect(judge.isWechat('_abcde')).toBe(false);
        });

        test('rejects empty string', () => {
            expect(judge.isWechat('')).toBe(false);
        });
    });
});
