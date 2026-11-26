import {
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
} from "react-router";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { api, getErrorCode, getErrorMessage } from "./api";

const page_size = 5;
const min_days = 1;
const max_days = 7;



