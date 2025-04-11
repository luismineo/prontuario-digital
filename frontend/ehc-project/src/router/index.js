import { createRouter, createWebHistory } from 'vue-router'
import StudentList from '../views/StudentList.vue'
import InactiveStudentList from '../views/InactiveStudentList.vue'

const routes = [
  {
    path: '/',
    name: 'students',
    component: StudentList,
  },
  {
    path: '/inactive',
    name: 'inactive-students',
    component: InactiveStudentList,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
