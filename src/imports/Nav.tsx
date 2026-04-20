import svgPaths from "./svg-3ccepwo16f";
import imgOliTorusLogoPng from "figma:asset/8c8178f23cf9e548053c0b0eea5affd944a3683c.png";

function OliTorusLogoPng() {
  return (
    <div className="h-[36px] max-w-[172.8000030517578px] relative shrink-0 w-[172.8px]" data-name="oli_torus_logo.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgOliTorusLogoPng} />
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="h-full relative shrink-0" data-name="Link">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col h-full items-start justify-center pb-[3px] relative">
          <OliTorusLogoPng />
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="absolute content-stretch flex h-[56px] items-start left-0 pb-[9px] pt-[8px] top-0 w-[192px]" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(15,13,15,0.05)] border-b border-solid inset-0 pointer-events-none" />
      <Link />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col h-[24px] items-start left-[20px] overflow-clip right-[15px] top-[241px]" data-name="Container">
      <div className="flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#353740] text-[14px] uppercase whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Tokamak Test</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute h-[35px] left-[8px] overflow-clip right-[23px] top-[317px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[12px] items-center left-1/2 px-[12px] py-[8px] rounded-[8px] top-1/2 w-[169px]" data-name="Component 7">
        <div className="relative shrink-0 size-[20px]" data-name="Component 4">
          <div className="absolute inset-[5%]" data-name="Vector">
            <div className="absolute inset-[-5.56%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <path d={svgPaths.p2ef1f600} id="Vector" stroke="var(--stroke-0, #757682)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#757682] text-[14px] text-center tracking-[-0.35px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="leading-[20px]">Create</p>
        </div>
        <div className="flex items-center justify-center relative shrink-0 size-[24px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
          <div className="-rotate-90 flex-none">
            <div className="relative size-[24px]" data-name="Component 8">
              <div className="absolute inset-[33.33%_20.83%]" data-name="Vector">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7.99998">
                  <path d={svgPaths.p18eb6100} fill="var(--fill-0, #BAB8BF)" id="Vector" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Component() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[12px] items-center left-1/2 px-[12px] py-[8px] rounded-[8px] top-1/2 w-[169px]" data-name="Component 7">
      <div className="h-[21px] relative shrink-0 w-[20px]" data-name="Component 4">
        <div className="absolute inset-[6.92%_4.76%_10%_8%]" data-name="Vector">
          <div className="absolute inset-[-5.46%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.3533 19.3533">
              <path d={svgPaths.p3c3323a0} id="Vector" stroke="var(--stroke-0, #757682)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.90476" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#757682] text-[14px] text-center tracking-[-0.35px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">Publish</p>
      </div>
      <div className="bg-[#0062f2] content-stretch flex items-center justify-center px-[6px] py-[4px] relative rounded-[999px] shrink-0" data-name="Badge/Unread-Messages">
        <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[12px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="leading-[12px]">13</p>
        </div>
      </div>
      <div className="flex items-center justify-center relative shrink-0 size-[24.075px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[-89.82deg]">
          <div className="relative size-[24px]" data-name="Component 4">
            <div className="absolute inset-[33.33%_20.83%]" data-name="Vector">
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7.99998">
                <path d={svgPaths.p18eb6100} fill="var(--fill-0, #BAB8BF)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute h-[35px] left-[8px] overflow-clip right-[23px] top-[360px]" data-name="Button">
      <Component />
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute h-[35px] left-[11px] overflow-clip right-[20px] top-[409px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[12px] items-center left-1/2 px-[12px] py-[8px] rounded-[8px] top-1/2 w-[169px]" data-name="Component 7">
        <div className="relative shrink-0 size-[20px]" data-name="Component 4">
          <div className="absolute inset-[5%]" data-name="Vector">
            <div className="absolute inset-[-5.56%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <path d={svgPaths.p1ea73880} id="Vector" stroke="var(--stroke-0, #757682)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#757682] text-[14px] text-center tracking-[-0.35px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="leading-[20px]">Improve</p>
        </div>
        <div className="flex items-center justify-center relative shrink-0 size-[24px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
          <div className="-rotate-90 flex-none">
            <div className="relative size-[24px]" data-name="Component 8">
              <div className="absolute inset-[33.33%_20.83%]" data-name="Vector">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7.99998">
                  <path d={svgPaths.p18eb6100} fill="var(--fill-0, #BAB8BF)" id="Vector" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Nav() {
  return (
    <div className="bg-white relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] size-full" data-name="Nav">
      <HorizontalBorder />
      <div className="absolute bg-[rgba(161,161,170,0.2)] content-stretch flex items-center justify-center px-[9px] py-[7.5px] right-[15px] rounded-bl-[52px] rounded-tl-[52px] size-[24px] top-[56px]" data-name="Component 5">
        <div className="h-[9px] relative shrink-0 w-[6px]" data-name="Component 4">
          <div className="absolute inset-[10.74%_25.53%_11.48%_16.13%]" data-name="Vector">
            <div className="absolute inset-[-10.71%_-21.43%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.99996 8.49992">
                <path d={svgPaths.p105b980} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] left-[20px] text-[#353740] text-[14px] top-[92px] w-[86.473px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">WORKSPACE</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col h-[35px] items-center justify-center left-[calc(50%-7.5px)] top-[calc(50%-273px)] w-[169px]" data-name="Component 6">
        <div className="bg-[#f4cfff] content-stretch flex gap-[12px] h-[36px] items-center px-[12px] py-[6px] relative rounded-[8px] shrink-0 w-[169px]" data-name="Component 7">
          <div className="h-[24px] relative shrink-0 w-[20px]" data-name="Component 4">
            <div className="absolute inset-[18.75%_16.67%_25.69%_12.5%]" data-name="Vector">
              <div className="absolute inset-[-6.25%_-5.88%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.8333 15">
                  <path d={svgPaths.p1037a500} id="Vector" stroke="var(--stroke-0, #353740)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#353740] text-[14px] tracking-[-0.35px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[20px]">Course Author</p>
          </div>
        </div>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col h-[35px] items-center justify-center left-[calc(50%-7.5px)] top-[calc(50%-230px)] w-[169px]" data-name="Component 6">
        <div className="content-stretch flex gap-[12px] h-[36px] items-center px-[12px] py-[6px] relative rounded-[8px] shrink-0 w-[169px]" data-name="Component 7">
          <div className="h-[24px] relative shrink-0 w-[20px]" data-name="Component 4">
            <div className="absolute inset-[22.22%_12.5%]" data-name="Vector">
              <div className="absolute inset-[-6.25%_-5.56%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 15">
                  <path d={svgPaths.p8415070} id="Vector" stroke="var(--stroke-0, #757682)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#757682] text-[14px] tracking-[-0.35px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[20px]">Instructor</p>
          </div>
        </div>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col h-[35px] items-center justify-center left-[calc(50%-7.5px)] top-[calc(50%-187px)] w-[169px]" data-name="Component 6">
        <div className="content-stretch flex gap-[12px] h-[36px] items-center px-[12px] py-[4.5px] relative rounded-[8px] shrink-0 w-[169px]" data-name="Component 7">
          <div className="h-[27px] relative shrink-0 w-[20px]" data-name="Component 4">
            <div className="absolute inset-[27.29%_6.2%_27.29%_6.19%]" data-name="Vector">
              <div className="absolute inset-[-6.27%_-4.39%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.0598 13.8034">
                  <path d={svgPaths.p33c39000} id="Vector" stroke="var(--stroke-0, #757682)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.53846" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#757682] text-[14px] tracking-[-0.35px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[20px]">Student</p>
          </div>
        </div>
      </div>
      <Container />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col items-center justify-center left-[calc(50%-7.5px)] top-[calc(50%-111.5px)] w-[169px]" data-name="Component 6">
        <div className="content-stretch flex gap-[12.5px] items-center px-[12px] py-[8px] relative rounded-[8px] shrink-0 w-[169px]" data-name="Component 7">
          <div className="h-[17px] relative shrink-0 w-[19px]" data-name="Component 4">
            <div className="absolute inset-[5.88%_5.26%]" data-name="Vector">
              <div className="absolute inset-[-6.67%_-5.88%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 17">
                  <path d={svgPaths.p31834880} id="Vector" stroke="var(--stroke-0, #757682)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#757682] text-[14px] tracking-[-0.35px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[20px]">Overview</p>
          </div>
        </div>
      </div>
      <Button />
      <Button1 />
      <Button2 />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[13px] h-[44px] items-center left-[calc(50%-7.5px)] pl-[13px] pr-[74.12px] py-[12px] top-[calc(50%+297.5px)] w-[169px]" data-name="Component 9">
        <div className="relative shrink-0 size-[18px]" data-name="Component 4">
          <div className="absolute inset-[8.33%]" data-name="Vector">
            <div className="absolute inset-[-5%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 16.5">
                <path d={svgPaths.p16aee00} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-[31.48%] left-[45.37%] right-[45.37%] top-1/2" data-name="Vector">
            <div className="absolute inset-[-22.5%_-45%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.16666 4.8333">
                <path d={svgPaths.p1129b00} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.7)] text-center tracking-[-0.35px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="leading-[20px]">Support</p>
        </div>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col h-[44px] items-center justify-center left-[calc(50%-7.5px)] py-[4px] top-[calc(50%+357.5px)] w-[169px]" data-name="Component 6">
        <div className="bg-[rgba(161,161,170,0.2)] content-stretch flex gap-[14px] h-[36px] items-center pl-[14px] pr-[54.61px] py-[8px] relative rounded-[8px] shrink-0 w-[169px]" data-name="Component 7">
          <div className="relative shrink-0 size-[16px]" data-name="Component 4">
            <div className="absolute inset-[49.98%_38.54%_50.02%_9.38%]" data-name="Vector">
              <div className="absolute inset-[-0.75px_-9%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.83333 1.5">
                  <path d="M0.75 0.75H9.08333" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-[29.15%_69.79%_50.02%_9.38%]" data-name="Vector">
              <div className="absolute inset-[-22.5%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.83333 4.83333">
                  <path d="M0.75 4.08333L4.08333 0.75" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-[49.98%_69.79%_29.19%_9.38%]" data-name="Vector">
              <div className="absolute inset-[-22.5%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.83333 4.83338">
                  <path d="M0.75 0.75L4.08333 4.08338" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-[8.31%_7.29%_8.35%_92.71%]" data-name="Vector">
              <div className="absolute inset-[-5.62%_-0.75px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.5 14.8334">
                  <path d="M0.75 14.0834V0.75" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.7)] tracking-[-0.35px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[20px]">Exit Project</p>
          </div>
        </div>
      </div>
    </div>
  );
}