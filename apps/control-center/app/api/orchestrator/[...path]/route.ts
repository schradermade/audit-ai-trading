/**
 * Proxy route for Orchestrator service
 */

import { NextRequest, NextResponse } from 'next/server';

const ORCHESTRATOR_URL =
  process.env.ORCHESTRATOR_URL || 'http://localhost:8000';

// export async function GET_HEALTH() {
//   const url = `${ORCHESTRATOR_URL}/health`;
//   try {
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     return { error: 'Failed to fetch health from orchestrator service' };
//   }
// }

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = `${ORCHESTRATOR_URL}/${path}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from orchestrator service' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = `${ORCHESTRATOR_URL}/${path}`;

  try {
    const body = await request.json();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward X-Trace-Id header if present
    const traceId = request.headers.get('X-Trace-Id');
    if (traceId) {
      headers['X-Trace-Id'] = traceId;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from orchestrator service' },
      { status: 500 }
    );
  }
}
