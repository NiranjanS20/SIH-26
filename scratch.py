import re

file_path2 = r'd:\Personal_Projects\SIH_26009\frontend\src\components\PortfolioView.tsx'
with open(file_path2, 'r', encoding='utf-8') as f:
    content2 = f.read()

match2 = re.search(r'(export interface PortfolioMineProfile \{.*?\n\})\s*(export const PORTFOLIO_MINES_DATA: PortfolioMineProfile\[\] = \[.*?\n\];\n?)', content2, re.DOTALL)
if match2:
    extracted = match2.group(0)
    with open(r'd:\Personal_Projects\SIH_26009\frontend\src\data\portfolioData.ts', 'a', encoding='utf-8') as out:
        out.write('\n\n' + extracted.replace('export const PORTFOLIO_MINES_DATA', 'export const PORTFOLIO_MINE_PROFILES'))
    print('Extraction successful!')
    
    new_content2 = content2[:match2.start()] + "import { PortfolioMineProfile, PORTFOLIO_MINE_PROFILES as PORTFOLIO_MINES_DATA } from '../data/portfolioData';\n" + content2[match2.end():]
    with open(file_path2, 'w', encoding='utf-8') as f:
        f.write(new_content2)
    print('PortfolioView updated.')
else:
    print('Could not find block in PortfolioView to replace')
