import { FLAGS, getFlagsByLetter, getFlagById, getLettersWithFlags } from '@/data/flags';

describe('getFlagsByLetter', () => {
  it('v の旗を返す', () => {
    const result = getFlagsByLetter('v');
    expect(result.length).toBeGreaterThan(0);
    result.forEach(f => expect(f.letter).toBe('v'));
  });

  it('大文字でも動作する', () => {
    expect(getFlagsByLetter('V')).toEqual(getFlagsByLetter('v'));
  });

  it('データのない文字は空配列を返す', () => {
    expect(getFlagsByLetter('z')).toEqual([]);
  });
});

describe('getFlagById', () => {
  it('verbose を取得できる', () => {
    const flag = getFlagById('v', 'verbose');
    expect(flag).toBeDefined();
    expect(flag!.long).toBe('--verbose');
  });

  it('存在しないIDはundefinedを返す', () => {
    expect(getFlagById('v', 'nonexistent')).toBeUndefined();
  });

  it('文字とIDが不一致のときundefinedを返す', () => {
    expect(getFlagById('a', 'verbose')).toBeUndefined();
  });
});

describe('getLettersWithFlags', () => {
  it('ソート済みのユニークな文字一覧を返す', () => {
    const letters = getLettersWithFlags();
    expect(letters).toEqual([...letters].sort());
    expect(new Set(letters).size).toBe(letters.length);
  });

  it('すべての文字がFLAGSに存在する', () => {
    const letters = getLettersWithFlags();
    letters.forEach(l => {
      expect(FLAGS.some(f => f.letter === l)).toBe(true);
    });
  });
});

describe('FLAGS データ整合性', () => {
  it('全フラグがlongプロパティを持つ', () => {
    FLAGS.forEach(f => expect(f.long).toMatch(/^--/));
  });

  it('全フラグのtoolsが1件以上ある', () => {
    FLAGS.forEach(f => expect(f.tools.length).toBeGreaterThan(0));
  });

  it('全フラグのimpactが1〜5の範囲', () => {
    FLAGS.forEach(f =>
      f.tools.forEach(t => {
        expect(t.impact).toBeGreaterThanOrEqual(1);
        expect(t.impact).toBeLessThanOrEqual(5);
      })
    );
  });
});
