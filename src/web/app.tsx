import { Route, Switch } from "wouter";
import Index from "./pages/index";
import HomeNovo from "./pages/home-novo"; // 🎨 Nova home moderna
import AdminPage from "./pages/admin";
import LoginPage from "./pages/login";
import RegistroPage from "./pages/registro";
import DashboardPage from "./pages/dashboard-novo"; // 🎨 Novo dashboard moderno
import AuthCallbackPage from "./pages/auth-callback";
import PlanoEstudoPage from "./pages/plano-estudo";
import OnboardingPage from "./pages/onboarding";
import PlanosPage from "./pages/planos";
import CheckoutPage from "./pages/checkout";
import MeuPedidoPage from "./pages/meu-pedido";
import AguardandoPacotePage from "./pages/aguardando-pacote";
import AguardandoPagamentoPage from "./pages/aguardando-pagamento";
import ConcursoPage from "./pages/concurso";
import PerfilEditarPage from "./pages/perfil-editar";
import PacotePage from "./pages/pacote";
import PacoteMateriaPage from "./pages/pacote-materia";
import PacoteEstudarPage from "./pages/pacote-estudar";
import SubjectStatsPage from "./pages/subject-stats";
import ConfiguracoesPage from "./pages/configuracoes";
import ConfigurarPacoteIndividual from "./pages/configurar-pacote-individual";
import EscolherSimulado from "./pages/escolher-simulado";
import PlanejamentoEstudos from "./pages/planejamento";
import EscolherMateria from "./pages/escolher-materia";
import AcompanharPedido from "./pages/acompanhar-pedido";
import SimuladoPage from "./pages/simulado";
import ElaborarPacote from "./pages/elaborar-pacote";
import ProdutosExclusivos from "./pages/produtos-exclusivos";
import { Provider } from "./components/provider";
import { AuthProvider } from "./lib/auth-context-supabase";
import { ProtectedRoute } from "./components/protected-route";

function App() {
        return (
                <Provider>
                        <AuthProvider>
                                <Switch>
                                        <Route path="/login" component={LoginPage} />
                                        <Route path="/registro" component={RegistroPage} />
                                        <Route path="/auth/callback" component={AuthCallbackPage} />
                                        <Route path="/cadastro" component={RegistroPage} />
                                        <Route path="/">
                                                <ProtectedRoute>
                                                        <HomeNovo />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/questoes/escolher">
                                                <ProtectedRoute>
                                                        <EscolherSimulado />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/planejamento">
                                                <ProtectedRoute>
                                                        <PlanejamentoEstudos />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/questoes">
                                                <ProtectedRoute>
                                                        <Index />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/admin">
                                                <ProtectedRoute>
                                                        <AdminPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/dashboard">
                                                <ProtectedRoute>
                                                        <DashboardPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/perfil">
                                                <ProtectedRoute>
                                                        <DashboardPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/perfil/editar">
                                                <ProtectedRoute>
                                                        <PerfilEditarPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/plano-de-estudo">
                                                <ProtectedRoute>
                                                        <PlanoEstudoPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/onboarding">
                                                <ProtectedRoute>
                                                        <OnboardingPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/planos">
                                                <ProtectedRoute>
                                                        <PlanosPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/checkout">
                                                <ProtectedRoute>
                                                        <CheckoutPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/meu-pedido">
                                                <ProtectedRoute>
                                                        <MeuPedidoPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/aguardando-pacote">
                                                <ProtectedRoute>
                                                        <AguardandoPacotePage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/aguardando-pagamento">
                                                <ProtectedRoute>
                                                        <AguardandoPagamentoPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/concurso/:id">
                                                <ProtectedRoute>
                                                        <ConcursoPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/pacote/:id">
                                                <ProtectedRoute>
                                                        <PacotePage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/pacote/:id/materia/:disciplina">
                                                <ProtectedRoute>
                                                        <PacoteMateriaPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/pacote/:id/estudar">
                                                <ProtectedRoute>
                                                        <PacoteEstudarPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/pacote/:id/materia/:disciplina/stats">
                                                <ProtectedRoute>
                                                        <SubjectStatsPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/configuracoes">
                                                <ProtectedRoute>
                                                        <ConfiguracoesPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/individual/configurar">
                                                <ProtectedRoute>
                                                        <ConfigurarPacoteIndividual />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/acompanhar-pedido">
                                                <ProtectedRoute>
                                                        <AcompanharPedido />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/simulado">
                                                <ProtectedRoute>
                                                        <SimuladoPage />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/escolher-materia">
                                                <ProtectedRoute>
                                                        <EscolherMateria />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/admin/elaborar-pacote/:id">
                                                <ProtectedRoute>
                                                        <ElaborarPacote />
                                                </ProtectedRoute>
                                        </Route>
                                        <Route path="/produtos-exclusivos">
                                                <ProtectedRoute>
                                                        <ProdutosExclusivos />
                                                </ProtectedRoute>
                                        </Route>
                                </Switch>
                        </AuthProvider>
                </Provider>
        );
}

export default App;
