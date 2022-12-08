import { LmdbCache } from '../LmdbCache';
import { defaultCacheOptions } from 'warp-contracts';
import * as fs from 'fs';
import { cache, getContractId, getSortKey } from './utils';
import { RootDatabase } from 'lmdb';

describe('Lmdb cache', () => {
  beforeEach(() => {
    if (fs.existsSync('./cache')) {
      fs.rmSync('./cache', { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync('./cache')) {
      fs.rmSync('./cache', { recursive: true });
    }
  });

  it('should return proper data', async () => {
    const sut = await cache(0, 100);

    await sut.put(
      {
        contractTxId: 'contract0',
        sortKey: '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      },
      { result: 'contract0:sortKey0' }
    );
    await sut.put(
      {
        contractTxId: 'contract1',
        sortKey: '000000860513,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      },
      { result: 'contract1:sortKey1' }
    );
    await sut.put(
      {
        contractTxId: 'contract1',
        sortKey: '000000860514,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      },
      { result: 'contract1:sortKey2' }
    );
    await sut.put(
      {
        contractTxId: 'contract1',
        sortKey: '000000860515,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      },
      { result: 'contract1:sortKey3' }
    );
    await sut.put(
      {
        contractTxId: 'contract2',
        sortKey: '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      },
      { result: 'contract2:sortKey1' }
    );

    expect(
      await sut.get(
        'contract2',
        '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual({
      sortKey: '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract2:sortKey1' }
    });
    expect(
      await sut.get(
        'contract1',
        '000000860514,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual({
      sortKey: '000000860514,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract1:sortKey2' }
    });
    expect(
      await sut.get(
        'contract0',
        '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual({
      sortKey: '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract0:sortKey0' }
    });
    expect(
      await sut.get(
        'contract0',
        '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b766'
      )
    ).toEqual(null);
    expect(
      await sut.get(
        'contract2',
        '000000860514,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual(null);
    expect(
      await sut.get(
        'contract1',
        '000000860516,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual(null);

    expect(
      await sut.getLessOrEqual(
        'contract2',
        '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual({
      sortKey: '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract2:sortKey1' }
    });
    expect(
      await sut.getLessOrEqual(
        'contract2',
        '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b768'
      )
    ).toEqual({
      sortKey: '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract2:sortKey1' }
    });
    expect(
      await sut.getLessOrEqual(
        'contract2',
        '000000860513,1643210931888,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b766'
      )
    ).toEqual(null);

    expect(
      await sut.getLessOrEqual(
        'contract1',
        '000000860513,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual({
      sortKey: '000000860513,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract1:sortKey1' }
    });

    expect(
      await sut.getLessOrEqual(
        'contract1',
        '000000860513,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b766'
      )
    ).toEqual(null);
    expect(
      await sut.getLessOrEqual(
        'contract0',
        '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b768'
      )
    ).toEqual({
      sortKey: '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract0:sortKey0' }
    });
    expect(
      await sut.getLessOrEqual(
        'contract0',
        '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767'
      )
    ).toEqual({
      sortKey: '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b767',
      cachedValue: { result: 'contract0:sortKey0' }
    });
    expect(
      await sut.getLessOrEqual(
        'contract0',
        '000000860512,1643210931796,81e1bea09d3262ee36ce8cfdbbb2ce3feb18a717c3020c47d206cb8ecb43b765'
      )
    ).toEqual(null);
  });

  it('respects limits for max and min interactions per contract', async () => {
    const max = 10;
    const min = 2;
    const sut = await cache(0, 0, {
      minEntriesPerContract: min,
      maxEntriesPerContract: max
    });

    for (let j = 0; j < max; j++) {
      await sut.put(
        {
          contractTxId: getContractId(0),
          sortKey: getSortKey(j)
        },
        { result: `contract${0}:${j}` }
      );
    }

    // All entries are available
    for (let j = 0; j < max; ++j) {
      const result = await sut.get(getContractId(0), getSortKey(j));
      expect(result).toBeTruthy();
      expect(result?.cachedValue.result).toBe(`contract${0}:${j}`);
    }

    // This put causes cleanup
    await sut.put(
      {
        contractTxId: getContractId(0),
        sortKey: getSortKey(max)
      },
      { result: `contract${0}:${max}` }
    );

    for (let i = 0; i <= max; i++) {
      const result = await sut.get(getContractId(0), getSortKey(i));
      if (i <= max - min) {
        expect(result).toBeFalsy();
      } else {
        expect(result).toBeTruthy();
        expect(result?.cachedValue.result).toBe(`contract${0}:${i}`);
      }
    }

    // This just adds another entry, no cleanup
    await sut.put(
      {
        contractTxId: getContractId(0),
        sortKey: getSortKey(max + 1)
      },
      { result: `contract${0}:${max + 1}` }
    );

    for (let i = 0; i <= max + 1; i++) {
      const result = await sut.get(getContractId(0), getSortKey(i));
      if (i <= max - min) {
        expect(result).toBeFalsy();
      } else {
        expect(result).toBeTruthy();
        expect(result?.cachedValue.result).toBe(`contract${0}:${i}`);
      }
    }
  });
});
