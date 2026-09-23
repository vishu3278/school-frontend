"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { api } from "@/lib/api";
import "../../print.css";

type Grade = {
  id: string;
  name: string;
};

type Section = {
  id: string;
  name: string;
};

type StudentDetail = {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phone?: string | null;
  phone2?: string | null;
  email?: string | null;
  address?: string | null;
  password?: string | null;
  motherName?: string | null;
  fatherName?: string | null;
  motherAadharNo?: string | null;
  fatherAadharNo?: string | null;
  motherOccupation?: string | null;
  fatherOccupation?: string | null;
  aadharNo?: string | null;
  religion?: string | null;
  grade: Grade;
  section?: Section;
  createdAt?: string;
  updatedAt?: string;
};

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const SCHOOL_NAME = "Greenfield Public School";
  const SCHOOL_TAGLINE = "Affiliated to CBSE";
  const VALID_UPTO = "31-Mar-2027";

  // Placeholder logo — swap this inline SVG for: <img src="your-logo.png" alt="logo">
  /* function logoMarkup() {
    return `
      <div className="id-card__logo">
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="19" fill="#fff" opacity="0.15"/>
          <text x="20" y="26" font-size="16" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="bold">S</text>
        </svg>
      </div>`;
  } */

  function cardMarkup(s) {
    return `
      <div class="id-card__header">
        
        <div class="id-card__school-name">
          ${SCHOOL_NAME}
          <small>${SCHOOL_TAGLINE}</small>
        </div>
      </div>
      <div class="id-card__body">
        <div class="id-card__photo">Photo</div>
        <div class="id-card__details">
          <div class="id-card__name">${s.firstName} ${s.lastName} (${s.gender}) <span class="id-card__admission">DOB: ${s.dateOfBirth}</span></div>
          <div class="id-card__row"><span class="k">Class</span><span class="v">${s.grade.name} - ${s.section.name}</span> <span class="k">Roll No</span><span class="v">${s.gender}</span></div>
          /* <div class="id-card__row"><span class="k">Roll No</span><span class="v">${s.gender}</span></div> */
          <div class="id-card__row"><span class="k">Adm No</span><span class="v">${s.admissionNo}</span></div>
          <div class="id-card__row"><span class="k">DOB</span><span class="v">${s.dateOfBirth}</span></div>
          <div class="id-card__row"><span class="k">Phone</span><span class="v">${s.phone}</span></div>
        </div>
      </div>
      <div class="id-card__footer">
        <div class="id-card__validity">Valid upto<br><strong>${VALID_UPTO}</strong></div>
        <div class="id-card__signature">
          <div class="line">Principal</div>
        </div>
      </div>`;
  }

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function loadStudent() {
      try {
        setLoading(true);
        setError("");

        const data = await api<StudentDetail>(`/students/${id}`);
        setStudent(data);
        // cardMarkup(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load student details",
        );
      } finally {
        setLoading(false);
      }
    }

    loadStudent();
  }, [id]);

  if (loading) {
    return <main className="p-6">Loading student details...</main>;
  }

  if (error) {
    return (
      <main className="p-6">
        <div className="mb-4">
          <Link href="/students" className="text-blue-600 hover:underline">
            ← Back to students
          </Link>
        </div>
        <p className="rounded bg-red-100 p-4 text-red-700">{error}</p>
      </main>
    );
  }

  if (!student) {
    return (
      <main className="p-6">
        <div className="mb-4">
          <Link href="/students" className="text-blue-600 hover:underline">
            ← Back to students
          </Link>
        </div>
        <p className="text-gray-700">Student not found.</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Details</h1>
          <p className="text-gray-600">Admission No: {student.admissionNo}</p>
        </div>

        <Link href="/students" className="rounded bg-gray-200 px-4 py-2">
          Back
        </Link>
      </div>

      <div className="grid gap-6 rounded border bg-white p-6 shadow-sm md:grid-cols-3">
        <div>
          <p className="text-sm text-gray-500">Full name</p>
          <p className="text-lg font-semibold">
            {student.firstName} {student.lastName}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Grade</p>
          <p className="text-lg font-semibold">{student.grade?.name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Section</p>
          <p className="text-lg font-semibold">
            {student.section?.name || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Date of birth</p>
          <p>{student.dateOfBirth || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Gender</p>
          <p>{student.gender || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p>{student.phone || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Phone 2</p>
          <p>{student.phone2 || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p>{student.email || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Aadhar Number</p>
          <p>{student.aadharNo || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Religion</p>
          <p>{student.religion || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Mother's Name</p>
          <p>{student.motherName || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Father's Name</p>
          <p>{student.fatherName || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Mother's Aadhaar</p>
          <p>{student.motherAadharNo || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Father's Aadhaar</p>
          <p>{student.fatherAadharNo || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Mother's Occupation</p>
          <p>{student.motherOccupation || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Father's Occupation</p>
          <p>{student.fatherOccupation || "-"}</p>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">Address</p>
          <p>{student.address || "-"}</p>
        </div>
      </div>
      <hr />
      <div className="preview-wrap">
        <div className="preview-scale">
          {/* <div className="id-card" id="singleCard">${cardMarkup(student)}</div> */}
          <div
            className="id-card"
            id="singleCard"
            dangerouslySetInnerHTML={{ __html: cardMarkup(student) }}
          />
        </div>
      </div>
    </main>
  );
}
