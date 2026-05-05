import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("No secret");

    const res = await fetch(
      "https://api.paystack.co/bank?country=kenya&currency=KES&use_cursor=false&perPage=100",
      { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" }
    );
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json() as { data: Array<{ name: string; code: string }> };
    return NextResponse.json({ banks: data.data ?? [] });
  } catch {
    return NextResponse.json({
      banks: [
        { name: "Equity Bank Kenya",         code: "068" },
        { name: "KCB Bank Kenya",            code: "011" },
        { name: "Cooperative Bank of Kenya", code: "011" },
        { name: "NCBA Bank Kenya",           code: "07"  },
        { name: "Absa Bank Kenya",           code: "030" },
        { name: "Standard Chartered Kenya",  code: "02"  },
        { name: "I&M Bank Kenya",            code: "057" },
        { name: "Diamond Trust Bank Kenya",  code: "63"  },
        { name: "Family Bank",               code: "070" },
        { name: "Stanbic Bank Kenya",        code: "31"  },
        { name: "National Bank of Kenya",    code: "012" },
        { name: "SBM Bank Kenya",            code: "076" },
        { name: "Gulf African Bank",         code: "006" },
        { name: "Prime Bank Kenya",          code: "10"  },
        { name: "HFC Limited",              code: "061" },
      ],
    });
  }
}
